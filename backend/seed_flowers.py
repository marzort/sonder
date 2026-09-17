from database import SessionLocal
from models import Flower

def seed_flowers():
    db = SessionLocal()

    try:
        flowers = [
            Flower(id=1, name="Cactus"),
            Flower(id=2, name="Daisy"),
            Flower(id=3, name="Tulip")
        ]

        db.add_all(flowers)
        db.commit()

        print("Flowers seeded successfully!")

        for flower in db.query(Flower).all():
            print(f"{flower.id}: {flower.name}")
        
    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

if __name__ == "__main__":
    seed_flowers()