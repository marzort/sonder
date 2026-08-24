from sqlalchemy import create_engine

DATABASE_URL = "postgresql+psycopg://campus:campus@localhost:5432/campus"

engine = create_engine(DATABASE_URL)
