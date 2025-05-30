from psycopg2.sql import SQL
from app.postgresql_utils import SchemaTable, Field, MinervaCursor
from typing import Optional, Tuple
from app.db_table_specs.minerva_auth_specs import Users
import json

#######################################
# Table Specs for Saved Projects tables
#######################################


class SavedProjects(SchemaTable):
    """
    The specification for the Saved Projects table in the
    Projects schema. This table will contain user-created projects.
    """

    SCHEMA = "projects"
    TABLE = "saved_projects"

    # Field constants
    PROJECT_ID = Field("project_id")
    PROJECT_NAME = Field("project_name")
    PROJECT_DESCRIPTION = Field("project_description")
    EMAIL = Field("email")
    STATUS = Field("status")
    TASKS = Field("tasks")
    CREATED_AT = Field("created_at")
    UPDATED_AT = Field("updated_at")
    DELETED_AT = Field("deleted_at")

    @classmethod
    def create_sql(cls):
        """
        Generates the SQL to create the users table.
        :return: A Composed object with the CREATE TABLE statement
        """
        return SQL(
            """
            CREATE TABLE IF NOT EXISTS {st} (
                {project_id} SERIAL,
                {email} STRING NOT NULL REFERENCES auth.users(email) ON
                           DELETE CASCADE,
                {project_name} STRING NOT NULL,
                {project_description} STRING NOT NULL,
                {tasks} JSONB,
                {status} VARCHAR(20) DEFAULT 'active',
                {created_at} TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                {updated_at} TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                {deleted_at} TIMESTAMP
                PRIMARY KEY ({project_id}, {email})
            );
        """
        ).format(
            st=cls.string(),
            project_id=cls.PROJECT_ID.string(),
            project_name=cls.PROJECT_NAME.string(),
            project_description=cls.PROJECT_DESCRIPTION.string(),
            email=cls.EMAIL.string(),
            tasks=cls.TASKS.string(),
            status=cls.STATUS.string(),
            created_at=cls.CREATED_AT.string(),
            updated_at=cls.UPDATED_AT.string(),
            deleted_at=cls.DELETED_AT.string(),
        )

    @classmethod
    def insert_record(cls, email: str, project_name: str, project_description: str, tasks: Optional[str]) -> None:
        """
        Insert a new saved project for a given user. Determines the next
        highest project_id for the given email.

        :param email: the string email address the user is registered under
        :param project_name: the string name of the project the user is
        creating
        :param project_description: the string description of the project that
        is starting
        :param tasks: an optional stringified JSONB input of tasks for the
        project
        """
        # Ensure the email is valid and exists in the auth.users table
        if not isinstance(email, str):
            raise SavedProjectInsertException(f"Email {email} is not a string!")
        Users.email_exists(email)

        # Validate other inputs
        if not isinstance(project_name, str):
            raise SavedProjectInsertException(f"Project name {project_name} is not a string!")

        if not isinstance(project_description, str):
            raise SavedProjectInsertException(f"Project description {project_description} is not a string!")

        if tasks is not None and not isinstance(tasks, str):
            raise SavedProjectInsertException(f"Tasks {tasks} is not a string!")

        # Query to determine the next project_id for the given email
        select_max_id_query = SQL(
            """
            SELECT COALESCE(MAX({project_id}), 0) + 1 AS next_project_id
            FROM {st}
            WHERE {email} = %s;
            """
        ).format(
            st=SavedProjects.string(), project_id=SavedProjects.PROJECT_ID.string(), email=SavedProjects.EMAIL.string()
        )

        insert_query = SQL(
            """
            INSERT INTO {st} ({project_id}, {email}, {project_name}, {project_description}, {tasks})
            VALUES (%s, %s, %s, %s, %s);
            """
        ).format(
            st=SavedProjects.string(),
            project_id=SavedProjects.PROJECT_ID.string(),
            email=SavedProjects.EMAIL.string(),
            project_name=SavedProjects.PROJECT_NAME.string(),
            project_description=SavedProjects.PROJECT_DESCRIPTION.string(),
            tasks=SavedProjects.TASKS.string(),
        )

        with MinervaCursor() as cur:
            # Determine the next project_id
            cur.execute(select_max_id_query, (email,))
            next_project_id = cur.fetchone()["next_project_id"]

            # Insert the new project with the calculated project_id
            cur.execute(
                insert_query,
                (
                    next_project_id,
                    email,
                    project_name,
                    project_description,
                    json.dumps(tasks) if tasks is not None else None,
                ),
            )

        return next_project_id

    @classmethod
    def update_record(
        cls,
        project_id: int,
        project_name: Optional[str] = None,
        project_description: Optional[str] = None,
        tasks: Optional[str] = None,
    ) -> None:
        """
        Update an existing saved project by project_id.

        :param project_id: The integer ID for the edited project.
        :param project_name: The new project name (optional).
        :param project_description: The new project description (optional).
        :param tasks: An optional stringified JSONB input of tasks for the project.
        :raises SavedProjectUpdateException: If no fields to update were provided or project_id is invalid.
        """
        if not isinstance(project_id, int):
            raise SavedProjectUpdateException(f"Project ID {project_id} is not an integer!")

        # Construct the update query dynamically
        updates = []
        params = []

        if project_name:
            updates.append(SQL("{field} = %s").format(field=cls.PROJECT_NAME.string()))
            params.append(project_name)

        if project_description:
            updates.append(SQL("{field} = %s").format(field=cls.PROJECT_DESCRIPTION.string()))
            params.append(project_description)

        if tasks:
            updates.append(SQL("{field} = %s").format(field=cls.TASKS.string()))
            params.append(tasks)

        if not updates:
            raise SavedProjectUpdateException("No fields to update were provided.")

        # Add the project_id as the final parameter for the WHERE clause
        params.append(project_id)

        update_query = SQL(
            """
            UPDATE {st}
            SET {fields}
            WHERE {project_id} = %s;
            """
        ).format(
            st=cls.string(),
            fields=SQL(", ").join(updates),
            project_id=cls.PROJECT_ID.string(),
        )

        # Execute the query
        with MinervaCursor() as cur:
            cur.execute(update_query, params)

    @classmethod
    def delete_record(cls, project_id: int, email: str) -> None:
        """
        Marks a project as deleted by updating its status to 'deleted'
        and setting the deleted_at timestamp.

        :param project_id: The ID of the project to be deleted.
        :param email: The email of the user who owns the project.
        """
        if not isinstance(project_id, int):
            raise ValueError(f"Project ID {project_id} must be an integer.")

        if not isinstance(email, str):
            raise ValueError(f"Email {email} must be a string.")

        update_query = SQL(
            """
            UPDATE {st}
            SET {status} = %s, {deleted_at} = CURRENT_TIMESTAMP
            WHERE {project_id} = %s AND {email} = %s;
            """
        ).format(
            st=cls.string(),
            status=cls.STATUS.string(),
            deleted_at=cls.DELETED_AT.string(),
            project_id=cls.PROJECT_ID.string(),
            email=cls.EMAIL.string(),
        )

        with MinervaCursor() as cur:
            cur.execute(update_query, ("deleted", project_id, email))
            if cur.rowcount == 0:
                raise ValueError(f"No project found with project_id={project_id} and email={email}.")

    @classmethod
    def select_all(cls, email: str) -> Tuple:
        """
        Retrieves all saved projects for a specific user by email.
        :return: JSON response containing the list of projects.
        """
        if not isinstance(email, str):
            raise SavedProjectInsertException(f"Email {email} is not a string!")
        Users.email_exists(email)
        select_query = SQL(
            """
            SELECT *
            FROM {st}
            WHERE {email} = %s AND {status} = 'active';
        """
        ).format(st=cls.string(), email=cls.EMAIL.string(), status=cls.STATUS.string())

        with MinervaCursor() as cur:
            cur.execute(select_query, (email,))
            results = cur.fetchall()

        return results

    @classmethod
    def select_one(cls, project_id: int) -> Tuple:
        """
        Retrieves a specific saved project by project_id.
        :param project_id: The ID of the project to retrieve.
        :return: JSON response containing the project details.
        """
        if not isinstance(project_id, int):
            raise SavedProjectSelectException(f"Project ID {project_id} is not an integer!")
        select_query = SQL(
            """
                SELECT *
                FROM {st}
                WHERE {project_id} = %s ;
            """
        ).format(st=cls.string(), email=cls.PROJECT_ID.string())

        with MinervaCursor() as cur:
            cur.execute(select_query, (project_id,))
            results = cur.fetchone()

        if results is None:
            raise SavedProjectSelectException(f"Project ID {project_id} does not exist!")

        return results


class SavedProjectInsertException(Exception):
    """
    An exception for a new saved project
    """

    pass


class SavedProjectUpdateException(Exception):
    """
    An exception for updating a saved project
    """

    pass


class SavedProjectSelectException(Exception):
    """
    An exception for selecting info from a saved project
    """

    pass


if __name__ == "__main__":
    pass
