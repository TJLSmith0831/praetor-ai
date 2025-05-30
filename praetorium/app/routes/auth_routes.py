from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
import bcrypt
from app.postgresql_utils import MinervaCursor
from app.db_table_specs.minerva_auth_specs import Users
from psycopg2.sql import SQL
from datetime import timedelta


auth_bp = Blueprint("auth", __name__)
blacklist = set()


# Users retrieval route
@auth_bp.route("/users", methods=["GET"])
@jwt_required()
def get_users():
    try:
        query = SQL("SELECT * FROM {st};").format(st=Users.string())

        with MinervaCursor() as cur:
            cur.execute(query)
            users = cur.fetchall()

        return jsonify(users), 200
    except Exception as e:
        return jsonify({Users.ERROR.string(): str(e)}), 500


# User Registration Route
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get(Users.EMAIL.raw)
    password = data.get(Users.PASSWORD)
    first_name = data.get(Users.FIRST_NAME.raw)
    last_name = data.get(Users.LAST_NAME.raw)
    plan = data.get(Users.PLAN.raw)

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    # SQL queries with variable format injection
    select_query = SQL("SELECT * FROM {st} WHERE {email} = %s;").format(st=Users.string(), email=Users.EMAIL.string())

    insert_query = SQL(
        """
        INSERT INTO {st} ({email}, {password_hash}, {first_name}, {last_name}, {plan})
        VALUES (%s, %s, %s, %s, %s);
    """
    ).format(
        st=Users.string(),
        email=Users.EMAIL.string(),
        password_hash=Users.PASSWORD_HASH.string(),
        first_name=Users.FIRST_NAME.string(),
        last_name=Users.LAST_NAME.string(),
        plan=Users.PLAN.string(),
    )

    with MinervaCursor() as cur:
        cur.execute(select_query, (email,))
        if len(cur.fetchall()) > 0:
            return jsonify({"message": "User already exists"}), 400

        # Insert the new user into the database
        cur.execute(insert_query, (email, hashed_password.decode("utf-8"), first_name, last_name, plan))

    return jsonify({"message": "User registered successfully"}), 201


# User Login Route
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get(Users.EMAIL.raw)
    password = data.get(Users.PASSWORD)

    # SQL query to find the user by email
    select_query = SQL("SELECT * FROM {st} WHERE {email} = %s LIMIT 1;").format(
        st=Users.string(), email=Users.EMAIL.string()
    )

    with MinervaCursor() as cur:
        cur.execute(select_query, (email,))
        user = cur.fetchone()

    # Verify the password
    if user is not None and bcrypt.checkpw(password.encode("utf-8"), user[Users.PASSWORD_HASH.raw].encode("utf-8")):
        access_token = create_access_token(identity=email, expires_delta=timedelta(hours=12))
        return (
            jsonify(
                {"access_token": access_token, "email_address": user[Users.EMAIL.raw], "plan": user[Users.PLAN.raw]}
            ),
            200,
        )

    return jsonify({"message": "Invalid credentials"}), 401


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    blacklist.add(jti)
    return jsonify({"message": "Successfully logged out"}), 200


# Delete user route
@auth_bp.route("/delete_user", methods=["DELETE"])
@jwt_required()
def delete_user():
    try:
        # Get the email from the JWT token
        token_email = get_jwt_identity()

        # Get the email from the request body
        data = request.get_json()
        email = data.get(Users.EMAIL.raw)

        # Ensure the email from the token matches the provided email
        if token_email != email:
            return jsonify({"message": "Unauthorized action"}), 403

        # Execute the delete query
        delete_query = SQL("DELETE FROM {st} WHERE {email} = %s;").format(st=Users.string(), email=Users.EMAIL.string())

        with MinervaCursor() as cur:
            cur.execute(delete_query, (email,))
            if cur.rowcount == 0:
                return jsonify({"message": "User not found"}), 404

        return jsonify({"message": "User deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_token = create_access_token(identity=current_user)
    return jsonify({"access_token": new_token}), 200


if __name__ == "__main__":
    pass
