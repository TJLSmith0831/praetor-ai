import pytest
from app.db_table_specs.minerva_projects_specs import SavedProjects
from app.postgresql_utils import MinervaCursor
import json


# Test the insert_record method
def test_insert_record_success(setup_user):
    SavedProjects.insert_record(
        email="testuser@example.com",
        project_name="Test Project",
        project_description="This is a test project description.",
        tasks='{"task1": "Define requirements", "task2": "Write code"}',
    )

    with MinervaCursor() as cur:
        cur.execute(
            "SELECT * FROM projects.saved_projects WHERE email = %s;",
            ("testuser@example.com",),
        )
        project = cur.fetchone()
        assert project is not None, "No project found for the provided email"
        assert project["project_name"] == "Test Project"
        assert project["project_description"] == "This is a test project description."
        assert json.loads(project["tasks"]) == {
            "task1": "Define requirements",
            "task2": "Write code",
        }


def test_insert_record_missing_fields():
    with pytest.raises(Exception):
        SavedProjects.insert_record(
            email="testuser@example.com",
            project_name=None,
            project_description=None,
            tasks=None,
        )


def test_insert_record_invalid_data_types():
    with pytest.raises(Exception):
        SavedProjects.insert_record(
            email=12345,
            project_name=67890,
            project_description=["Invalid", "Data"],
            tasks=None,
        )


def test_insert_record_none_tasks(setup_user):
    SavedProjects.insert_record(
        email="testuser@example.com",
        project_name="Project with No Tasks",
        project_description="A project without tasks.",
        tasks=None,
    )

    with MinervaCursor() as cur:
        cur.execute(
            "SELECT * FROM projects.saved_projects WHERE email = %s;",
            ("testuser@example.com",),
        )
        project = cur.fetchone()
        assert project["tasks"] is None


# Test the update_record method
def test_update_record_success(setup_user, setup_project):
    project_id = setup_project

    # Update the project
    SavedProjects.update_record(
        project_id=project_id, project_name="Updated Project Name", project_description="Updated Project Description"
    )

    # Verify the update
    with MinervaCursor() as cur:
        cur.execute("SELECT * FROM projects.saved_projects WHERE project_id = %s;", (project_id,))
        project = cur.fetchone()

    assert project is not None, "No project found with the given project_id"
    assert project["project_name"] == "Updated Project Name", "Project name not updated correctly"
    assert project["project_description"] == "Updated Project Description", "Project description not updated correctly"


def test_update_record_no_fields_to_update(setup_project):
    project_id = setup_project

    with pytest.raises(Exception, match="No fields to update were provided."):
        SavedProjects.update_record(project_id=project_id)


def test_update_record_invalid_data_types():
    with pytest.raises(Exception):
        SavedProjects.update_record(
            project_id="invalid_id",  # Should be an integer
            project_name=67890,
            project_description=["Invalid", "Data"],
            tasks=None,
        )


def test_add_task(setup_project):
    project_id = setup_project

    # Fetch the current tasks
    with MinervaCursor() as cur:
        cur.execute("SELECT tasks FROM projects.saved_projects WHERE project_id = %s;", (project_id,))
        result = cur.fetchone()
        tasks = result["tasks"]

    # Add a new task to the tasks list
    new_task = {
        "task_id": 2,
        "name": "Implement the front-end UI for workout logging",
        "task_description": "Create a user-friendly UI for logging workouts.",
        "task_priority": "Medium",
        "task_start_date": "",
        "task_due_date": "",
        "tasks": [],
    }
    tasks.append(new_task)

    # Update the project with the new tasks
    SavedProjects.update_record(
        project_id=project_id,
        tasks=json.dumps(tasks),
    )

    # Verify the task was added
    with MinervaCursor() as cur:
        cur.execute("SELECT tasks FROM projects.saved_projects WHERE project_id = %s;", (project_id,))
        updated_tasks = cur.fetchone()["tasks"]

    assert any(task["name"] == new_task["name"] for task in updated_tasks), "New task not added correctly"


def test_delete_task(setup_project):
    project_id = setup_project

    # Fetch the current tasks
    with MinervaCursor() as cur:
        cur.execute("SELECT tasks FROM projects.saved_projects WHERE project_id = %s;", (project_id,))
        result = cur.fetchone()
        tasks = result["tasks"]

    # Remove a task from the tasks list
    tasks = [task for task in tasks if task["task_id"] != 1]

    # Update the project with the updated tasks
    SavedProjects.update_record(
        project_id=project_id,
        tasks=json.dumps(tasks),
    )

    # Verify the task was deleted
    with MinervaCursor() as cur:
        cur.execute("SELECT tasks FROM projects.saved_projects WHERE project_id = %s;", (project_id,))
        updated_tasks = cur.fetchone()["tasks"]

    assert not any(task["task_id"] == 1 for task in updated_tasks), "Task not deleted correctly"


def test_edit_tasks(setup_project):
    project_id = setup_project

    # Fetch the current tasks
    with MinervaCursor() as cur:
        cur.execute("SELECT tasks FROM projects.saved_projects WHERE project_id = %s;", (project_id,))
        result = cur.fetchone()
        tasks = result["tasks"]

    # Ensure the initial task is there
    assert tasks[0]["name"] == "Develop the workout logging feature", "Initial task not found"

    # Modify the task
    tasks[0]["task_description"] = "Updated description for workout logging"
    tasks[0]["task_priority"] = "Critical"

    # Update the project with the modified tasks
    SavedProjects.update_record(
        project_id=project_id,
        tasks=json.dumps(tasks),
    )

    # Fetch the updated project to verify changes
    with MinervaCursor() as cur:
        cur.execute("SELECT tasks FROM projects.saved_projects WHERE project_id = %s;", (project_id,))
        updated_tasks = cur.fetchone()["tasks"]

    # Assert that the task was updated correctly
    assert (
        updated_tasks[0]["task_description"] == "Updated description for workout logging"
    ), "Task description not updated correctly"
    assert updated_tasks[0]["task_priority"] == "Critical", "Task priority not updated correctly"
