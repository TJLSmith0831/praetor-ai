from psycopg2.sql import SQL, Composed
from app.postgresql_utils import SchemaTable, Field, MinervaCursor

#############################
# Table Specs for Auth tables
#############################


class Users(SchemaTable):
    """
    The specification for the auth.users SchemaTable. This contains all user
    login information.
    """

    # Schema and table name
    SCHEMA = "auth"
    TABLE = "users"

    # Field constants
    ID = Field("id")
    EMAIL = Field("email")
    PASSWORD_HASH = Field("password_hash")
    FIRST_NAME = Field("first_name")
    LAST_NAME = Field("last_name")
    PROFILE_PICTURE = Field("profile_picture")
    ROLE = Field("role")
    STATUS = Field("status")
    CREATED_AT = Field("created_at")
    UPDATED_AT = Field("updated_at")
    LAST_LOGIN = Field("last_login")
    IS_VERIFIED = Field("is_verified")
    DELETED_AT = Field("deleted_at")
    PLAN = Field("plan")

    # Other constants
    PASSWORD = "password"

    @classmethod
    def create_sql(cls) -> Composed:
        """
        Generates the SQL to create the users table.
        :return: A Composed object with the CREATE TABLE statement
        """
        return SQL(
            """
            CREATE TABLE IF NOT EXISTS {st} (
                {id} SERIAL PRIMARY KEY,
                {email} VARCHAR(100) UNIQUE NOT NULL,
                {password_hash} VARCHAR(255) NOT NULL,
                {first_name} VARCHAR(50),
                {last_name} VARCHAR(50),
                {profile_picture} TEXT,
                {role} VARCHAR(20) DEFAULT 'user',
                {status} VARCHAR(20) DEFAULT 'active',
                {created_at} TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                {updated_at} TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                {last_login} TIMESTAMP,
                {is_verified} BOOLEAN DEFAULT FALSE,
                {deleted_at} TIMESTAMP,
                {plan} TEXT
            );
        """
        ).format(
            st=cls.string(),
            id=cls.ID.string(),
            email=cls.EMAIL.string(),
            password_hash=cls.PASSWORD_HASH.string(),
            first_name=cls.FIRST_NAME.string(),
            last_name=cls.LAST_NAME.string(),
            profile_picture=cls.PROFILE_PICTURE.string(),
            role=cls.ROLE.string(),
            status=cls.STATUS.string(),
            created_at=cls.CREATED_AT.string(),
            updated_at=cls.UPDATED_AT.string(),
            last_login=cls.LAST_LOGIN.string(),
            is_verified=cls.IS_VERIFIED.string(),
            deleted_at=cls.DELETED_AT.string(),
            plan=cls.PLAN.string(),
        )

    @classmethod
    def email_exists(cls, email: str) -> bool:
        """
        Determines if the email is registered
        :param email: string email address
        :returns: a boolean whether the user exists in the auth.users
        table
        """
        select_query = SQL("SELECT * FROM {st} WHERE {email} = %s;").format(
            st=Users.string(), email=Users.EMAIL.string()
        )

        with MinervaCursor() as cur:
            cur.execute(select_query, (email,))
            result = cur.fetchone()

        if result is None:
            raise EmailDoesNotExistException(f"{email} is not registered!")

        return True


class EmailDoesNotExistException(Exception):
    """
    The Exception for an unregistered user email
    """

    pass
