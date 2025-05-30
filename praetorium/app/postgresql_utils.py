from abc import ABCMeta
from dotenv import load_dotenv
from psycopg2 import connect, extensions
from psycopg2.extras import RealDictCursor
from psycopg2.sql import SQL, Identifier
import os
from app.database_const import MINERVA
from stringcase import camelcase

load_dotenv()

# Access the password and other DB credentials
MINERVA_PASSWORD = os.getenv("MINERVA_PASSWORD")
MINERVA_USER = os.getenv("MINERVA_USER", "postgres")
MINERVA_HOST = os.getenv("MINERVA_HOST", "localhost")


class Field:
    """
    Represents a database field (column) in a table.
    """

    def __init__(self, name: str):
        self.name = name

    def string(self):
        """
        Returns the field name as an Identifier object.
        """
        from psycopg2.sql import Identifier

        return Identifier(self.name)

    def camelcase(self) -> str:
        """
        Converts the field name to camelCase.
        """
        parts = self.name.split("_")
        return parts[0] + "".join(word.capitalize() for word in parts[1:])

    @property
    def raw(self) -> str:
        """
        Returns the field name as a raw string.
        """
        return self.name


class SchemaTable:
    """
    Base class representing a database table with a schema. Provides methods
    to return the schema, table, and fully qualified table name.
    """

    SCHEMA = ""
    TABLE = ""

    @classmethod
    def schema(cls) -> Identifier:
        """
        Returns the schema name as an Identifier object.
        """
        return Identifier(cls.SCHEMA)

    @classmethod
    def table(cls) -> Identifier:
        """
        Returns the table name as an Identifier object.
        """
        return Identifier(cls.TABLE)

    @classmethod
    def string(cls) -> SQL:
        """
        Returns the fully qualified table name in the format {schema}.{table}.
        """
        return SQL("{}.{}").format(cls.schema(), cls.table())


class MinervaCursor(object, metaclass=ABCMeta):
    """
    A psycopg2 cursor that executres queries and is handled in a 'with' block.
    The with block usage eliminates worries about closing the cursor, returning
    the connection, or committing the changes.
    """

    @classmethod
    def get_minerva_connection(cls):
        """
        Creates and returns a new connection to the Minerva PostgreSQL
        database.
        """
        return connect(
            host=MINERVA_HOST,
            database=MINERVA,
            user=MINERVA_USER,
            password=MINERVA_PASSWORD,
            cursor_factory=RealDictCursor,
        )

    def __init__(self):
        """
        Initializes the MinervaCursor instance by establishing a
        connection to the database.
        """
        self.minerva_connection = None
        self.cursor = None

    def __enter__(self) -> extensions.cursor:
        """
        The code that will execute at the beginning of the "with" clause.

        :return: A cursor with the Minerva role that will be assigned to
        whatever variable is used with "as".
        """
        # Establish the connection
        self.minerva_connection = self.get_minerva_connection()

        # Create a cursor from the connection
        self.cursor = self.minerva_connection.cursor()

        # Return the cursor to be used in the "with" block
        return self.cursor

    def __exit__(self, exception_type, exception_value, exception_traceback):
        """
        The tear-down code that will close the cursor at the end of the
        statement. If there were any issues, rollback changes. Otherwise,
        close the cursor, commit to the DB, and return the connection.
        """
        try:
            if exception_type is not None:
                # If there was an exception, rollback any changes
                self.minerva_connection.rollback()
                print("Transaction rolled back due to an error.")
            else:
                # If no exceptions, commit the transaction
                self.minerva_connection.commit()
                print("Transaction committed successfully.")
        except Exception as e:
            print(f"Error during commit/rollback: {e}")
        finally:
            # Close the cursor and connection
            if self.cursor:
                self.cursor.close()
                print("Cursor closed.")
            if self.minerva_connection:
                self.minerva_connection.close()
                print("Connection closed.")


def to_camel_case(data):
    if isinstance(data, list):
        return [to_camel_case(item) for item in data]
    if isinstance(data, dict):
        return {camelcase(key): to_camel_case(value) for key, value in data.items()}
    return data
