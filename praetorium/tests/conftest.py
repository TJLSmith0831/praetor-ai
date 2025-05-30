import pytest
import bcrypt
from flask import json
from app import create_app
from app.postgresql_utils import MinervaCursor
from psycopg2.sql import SQL


# ✅ Set up the Flask test client
@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


# ✅ Set up a test user
@pytest.fixture
def setup_user():
    """Insert a test user into the database for testing purposes."""
    password = "TestPassword123!"
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    with MinervaCursor() as cur:
        cur.execute(
            """
            INSERT INTO auth.users (email, password_hash)
            VALUES (%s, %s) ON CONFLICT DO NOTHING;
        """,
            (
                "testuser@example.com",
                hashed_password,
            ),
        )

    yield

    with MinervaCursor() as cur:
        cur.execute("DELETE FROM auth.users WHERE email = %s;", ("testuser@example.com",))


# ✅ Set up a test user and project
@pytest.fixture
def setup_test_data():
    """Insert a test user and project into the database for testing."""
    email = "testuser@example.com"

    with MinervaCursor() as cur:
        # Insert test user
        cur.execute(
            """
            INSERT INTO auth.users (email, password_hash)
            VALUES (%s, %s)
            ON CONFLICT DO NOTHING;
            """,
            (email, bcrypt.hashpw("TestPassword123!".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")),
        )

        # Insert test project
        cur.execute(
            """
            INSERT INTO projects.saved_projects (email, project_name, project_description, tasks)
            VALUES (%s, %s, %s, %s)
            RETURNING project_id;
            """,
            (
                email,
                "Initial Project",
                "A sample project for testing.",
                json.dumps(
                    [
                        {
                            "task_id": 1,
                            "name": "Initial Task",
                            "task_description": "An initial task for testing.",
                            "task_priority": "High",
                            "task_start_date": "",
                            "task_due_date": "",
                            "tasks": [],
                        }
                    ]
                ),
            ),
        )
        project_id = cur.fetchone()["project_id"]

    yield email, project_id

    # Cleanup
    with MinervaCursor() as cur:
        cur.execute("DELETE FROM auth.users WHERE email = %s;", (email,))
        cur.execute("DELETE FROM projects.saved_projects WHERE project_id = %s;", (project_id,))


@pytest.fixture
def setup_project(setup_user):
    """Insert a test project into the database for testing purposes."""
    example_tasks = [
        {
            "task_id": 1,
            "name": "Develop the workout logging feature",
            "task_description": """
                                Create a feature that allows users to log their workouts,
                                including type, duration, and calories burned.
                                """,
            "task_priority": "High",
            "task_start_date": "",
            "task_due_date": "",
            "tasks": [
                {
                    "task_id": 1,
                    "name": "Design the database schema to store workout data",
                    "task_description": """
                                        Create a database schema to store workout details such as
                                        exercise type, duration, and calories burned.
                                        """,
                    "task_priority": "High",
                    "task_start_date": "",
                    "task_due_date": "",
                    "tasks": [],
                }
            ],
        }
    ]
    test_project = {
        "email": "testuser@example.com",
        "project_name": "Test Project",
        "project_description": "A sample project for testing.",
        "tasks": example_tasks,
    }

    with MinervaCursor() as cur:
        insert_query = SQL(
            """
            INSERT INTO projects.saved_projects (email, project_name,
                                                 project_description, tasks)
            VALUES (%s, %s, %s, %s) RETURNING project_id;
        """
        )
        cur.execute(
            insert_query,
            (
                test_project["email"],
                test_project["project_name"],
                test_project["project_description"],
                json.dumps(test_project["tasks"]),
            ),
        )
        result = cur.fetchone()
        if result is None:
            raise Exception("Failed to insert project and retrieve project_id")
        project_id = result["project_id"]

    yield project_id

    with MinervaCursor() as cur:
        cur.execute(
            "DELETE FROM projects.saved_projects WHERE project_name = %s;",
            ("Test Project",),
        )


# ✅ Generate auth headers for protected routes
@pytest.fixture
def auth_headers(client, setup_user):
    # Register and login a user, then return the auth headers with JWT token
    test_user = {"email": "testuser@example.com", "password": "TestPassword123!"}

    response = client.post("/auth/login", json={"email": test_user["email"], "password": test_user["password"]})
    token = response.json["access_token"]

    return {"Authorization": f"Bearer {token}"}
