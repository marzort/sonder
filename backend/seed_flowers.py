from database import SessionLocal
from models import Flower

from data.flower_facts import FLOWER_FACTS

def seed_flowers():
    db = SessionLocal()

    try:
        flowers = []
        index = 1
        for name, fact in FLOWER_FACTS.items():
            flowers.append(
                Flower(id=index, name=name, fact=fact)
            )
            index += 1

        db.add_all(flowers)
        db.commit()

        print("Flowers seeded successfully!")

        for flower in db.query(Flower).all():
            print(f"{flower.id}: {flower.name}")
            print(f"{flower.fact}")
        
    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

if __name__ == "__main__":
    seed_flowers()