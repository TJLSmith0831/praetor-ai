import pytest
import bcrypt
from app.postgresql_utils import MinervaCursor
from psycopg2.sql import SQL
from app.db_table_specs.minerva_auth_specs import Users


# Test that the connection can be established
def test_minerva_connection():
    try:
        with MinervaCursor() as cur:
            # Query the pg_database system table to check if Minerva exists
            cur.execute("SELECT datname FROM pg_database WHERE datname = %s;", ("minerva",))
            result = cur.fetchone()
            assert result["datname"] == "minerva"
    except Exception as e:
        pytest.fail(f"Connection test failed: {e}")


# Test the /register route
def test_register_route(client):
    # Define the test user data
    test_user = {
        "email": "testuser@example.com",
        "password": "TestPassword123!",
        "first_name": "test",
        "last_name": "user",
    }

    # Send a POST request to the /register route
    response = client.post("/auth/register", json=test_user)

    # Check the response
    assert response.status_code == 201
    assert response.json == {"message": "User registered successfully"}

    # Verify the user was inserted into the database
    with MinervaCursor() as cur:
        cur.execute("SELECT * FROM auth.users WHERE email = %s", (test_user["email"],))
        user = cur.fetchone()
        assert user is not None
        assert user["email"] == test_user["email"]

    # Clean up: Remove the test user from the database
    with MinervaCursor() as cur:
        cur.execute("DELETE FROM auth.users WHERE email = %s", (test_user["email"],))


# Test the /register route for an already existing user
def test_register_existing_user(client):
    # Define the test user data
    test_user = {
        "email": "testuser@example.com",
        "password": "TestPassword123!",
        "first_name": "test",
        "last_name": "user",
    }

    # Hash the password for insertion
    hashed_password = bcrypt.hashpw(test_user["password"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    # Insert the test user into the database
    insert_query = SQL(
        """
        INSERT INTO {st} ({email}, {password_hash}, {first_name}, {last_name})
        VALUES (%s, %s, %s, %s);
    """
    ).format(
        st=Users.string(),
        email=Users.EMAIL.string(),
        password_hash=Users.PASSWORD_HASH.string(),
        first_name=Users.FIRST_NAME.string(),
        last_name=Users.LAST_NAME.string(),
    )

    with MinervaCursor() as cur:
        cur.execute(
            insert_query,
            (
                test_user["email"],
                hashed_password,
                test_user["first_name"],
                test_user["last_name"],
            ),
        )

    # Send a POST request to the /register route with the same email
    response = client.post("/auth/register", json=test_user)

    # Check the response for an already existing user
    assert response.status_code == 400
    assert response.json == {"message": "User already exists"}

    # Clean up the test user from the database
    delete_query = SQL("DELETE FROM {st} WHERE {email} = %s;").format(st=Users.string(), email=Users.EMAIL.string())

    with MinervaCursor() as cur:
        cur.execute(delete_query, (test_user["email"],))


# Test the /login route
def test_login_route(client):
    # Define the test user data
    test_user = {
        "email": "testuser@example.com",
        "password": "TestPassword123!",
        "first_name": "test",
        "last_name": "user",
    }

    # Hash the password for insertion
    hashed_password = bcrypt.hashpw(test_user["password"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    # Insert the test user into the database
    insert_query = SQL(
        """
        INSERT INTO {st} ({email}, {password_hash}, {first_name}, {last_name})
        VALUES (%s, %s, %s, %s);
    """
    ).format(
        st=Users.string(),
        email=Users.EMAIL.string(),
        password_hash=Users.PASSWORD_HASH.string(),
        first_name=Users.FIRST_NAME.string(),
        last_name=Users.LAST_NAME.string(),
    )

    with MinervaCursor() as cur:
        cur.execute(
            insert_query,
            (
                test_user["email"],
                hashed_password,
                test_user["first_name"],
                test_user["last_name"],
            ),
        )

    # Send a POST request to the /login route
    response = client.post("/auth/login", json={"email": test_user["email"], "password": test_user["password"]})

    # Check the response for a successful login and get the JWT token
    assert response.status_code == 200
    assert "access_token" in response.json
    token = response.json["access_token"]

    # Verify protected route access with the token
    headers = {"Authorization": f"Bearer {token}"}
    users_response = client.get("/auth/users", headers=headers)

    assert users_response.status_code == 200

    # Clean up the test user from the database
    delete_query = SQL("DELETE FROM {st} WHERE {email} = %s;").format(st=Users.string(), email=Users.EMAIL.string())
    with MinervaCursor() as cur:
        cur.execute(delete_query, (test_user["email"],))


# Test the /delete_user route
def test_delete_user_route(client, auth_headers):
    # Send a DELETE request to the /delete_user route with JWT token
    response = client.delete("/auth/delete_user", json={"email": "testuser@example.com"}, headers=auth_headers)

    # Check the response
    assert response.status_code == 200
    assert response.json == {"message": "User deleted successfully"}

    # Send another DELETE request to ensure the user is not found
    response = client.delete("/auth/delete_user", json={"email": "testuser@example.com"}, headers=auth_headers)
    assert response.status_code == 404
    assert response.json == {"message": "User not found"}
