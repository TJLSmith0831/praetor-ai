from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.db_table_specs.minerva_projects_specs import SavedProjects
from app.postgresql_utils import to_camel_case
import json

projects_bp = Blueprint("projects", __name__)


# Get all projects for the authenticated user
@projects_bp.route("/get_projects", methods=["GET"])
@jwt_required()
def get_projects():
    """
    Retrieves all saved projects for the authenticated user.
    :return: JSON response containing the list of projects.
    """
    email = get_jwt_identity()  # Get the user's email from the JWT

    try:
        projects = to_camel_case(SavedProjects.select_all(email=email))
        return jsonify({"projects": projects}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Get a specific project by project_id
@projects_bp.route("/get_project/<int:project_id>", methods=["GET"])
@jwt_required()
def get_project(project_id):
    """
    Retrieves a specific saved project by project_id for the authenticated user.
    :param project_id: The ID of the project to retrieve.
    :return: JSON response containing the project details.
    """
    try:
        project = SavedProjects.select_one(project_id=project_id)
        if not project:
            return jsonify({"error": "Project not found"}), 404
        return jsonify({"project": project}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Create a new project
@projects_bp.route("/create_project", methods=["POST"])
@jwt_required()
def insert_project():
    """
    Inserts a new project into the saved_projects table for the authenticated user.
    :return: JSON response with a success message or error.
    """
    data = request.get_json()

    email = get_jwt_identity()  # Get the user's email from the JWT
    project_name = data.get(SavedProjects.PROJECT_NAME.raw)
    project_description = data.get(SavedProjects.PROJECT_DESCRIPTION.raw)
    tasks = data.get(SavedProjects.TASKS.raw)

    # Ensure tasks is a valid JSON string
    if tasks is not None:
        tasks = json.dumps(tasks)

    if not project_name or not project_description:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        next_project_id = SavedProjects.insert_record(email, project_name, project_description, tasks)
        return jsonify({"message": "Project created successfully", "projectId": next_project_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Update an existing project
@projects_bp.route("/update_project", methods=["PUT"])
@jwt_required()
def update_project():
    """
    Updates an existing project in the saved_projects table for the authenticated user.
    :return: JSON response with a success message or error.
    """
    data = request.get_json()

    project_id = data.get(SavedProjects.PROJECT_ID.raw)
    project_name = data.get(SavedProjects.PROJECT_NAME.raw)
    project_description = data.get(SavedProjects.PROJECT_DESCRIPTION.raw)
    tasks = data.get(SavedProjects.TASKS.raw)

    # Ensure tasks is a valid JSON string
    if tasks is not None:
        tasks = json.dumps(tasks)

    if not project_id:
        return jsonify({"error": "Missing project_id"}), 400

    try:
        SavedProjects.update_record(project_id, project_name, project_description, tasks)
        return jsonify({"message": "Project updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@projects_bp.route("/delete_project", methods=["DELETE"])
@jwt_required()
def delete_project():
    """
    Deletes a project by marking it as deleted and updating the deleted_at field.
    :return: JSON response with a success or error message.
    """
    project_id = int(request.args.get("project_id"))
    email = get_jwt_identity()  # Get the user's email from the JWT

    if not project_id or not email:
        return jsonify({"error": "Both project_id and email are required."}), 400

    try:
        SavedProjects.delete_record(project_id, email)
        return jsonify({"message": "Project deleted successfully"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
