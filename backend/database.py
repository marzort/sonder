from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+psycopg://campus:campus@localhost:5432/campus"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(engine)

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()