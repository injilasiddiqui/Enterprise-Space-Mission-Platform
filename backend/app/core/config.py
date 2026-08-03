import os

APP_NAME = "Enterprise Space Mission Operations Platform"

APP_VERSION = "1.0.0"

DATABASE_NAME = os.getenv(
    "DATABASE_NAME",
    "space_mission_db"
)

DATABASE_USER = os.getenv(
    "DATABASE_USER",
    "postgres"
)

DATABASE_PASSWORD = os.getenv(
    "DATABASE_PASSWORD",
    "injila2005"
)

DATABASE_HOST = os.getenv(
    "DATABASE_HOST",
    "localhost"
)

DATABASE_PORT = os.getenv(
    "DATABASE_PORT",
    "5432"
)