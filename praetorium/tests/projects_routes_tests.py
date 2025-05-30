from app.postgresql_utils import MinervaCursor


# Test the insert_project route
def test_insert_project(client, setup_test_data, auth_headers):
    email, _ = setup_test_data

    new_project = {
        "email": email,
        "project_name": "New Project",
        "project_description": "This is a new test project.",
        "tasks": [
            {
                "task_id": 1,
                "name": "Define requirements",
                "task_description": "Gather requirements for the project.",
                "task_priority": "High",
                "task_start_date": "",
                "task_due_date": "",
                "tasks": [],
            }
        ],
    }

    # Send a POST request to /projects/create_project with auth headers
    response = client.post("/projects/create_project", json=new_project, headers=auth_headers)
    assert response.status_code == 201
    assert response.json["message"] == "Project created successfully"

    # Verify the project was inserted
    with MinervaCursor() as cur:
        cur.execute("SELECT * FROM projects.saved_projects WHERE project_name = %s;", ("New Project",))
        project = cur.fetchone()

    assert project is not None, "Project not found in the database."


# Test the update_project route
def test_update_project(client, setup_test_data, auth_headers):
    _, project_id = setup_test_data

    updated_project = {
        "project_id": project_id,
        "project_name": "Updated Project",
        "project_description": "This is an updated project description.",
        "tasks": [
            {
                "task_id": 1,
                "name": "Initial Task",
                "task_description": "Updated task description.",
                "task_priority": "Critical",
                "task_start_date": "",
                "task_due_date": "",
                "tasks": [],
            }
        ],
    }

    # Send a PUT request to /projects/update_project with auth headers
    response = client.put("/projects/update_project", json=updated_project, headers=auth_headers)
    assert response.status_code == 200
    assert response.json["message"] == "Project updated successfully"

    # Verify the project was updated
    with MinervaCursor() as cur:
        cur.execute("SELECT * FROM projects.saved_projects WHERE project_id = %s;", (project_id,))
        project = cur.fetchone()

    assert project["project_name"] == "Updated Project", "Project name not updated correctly."
    assert (
        project["project_description"] == "This is an updated project description."
    ), "Project description not updated correctly."
    assert (
        project["tasks"][0]["task_description"] == "Updated task description."
    ), "Task description not updated correctly."
