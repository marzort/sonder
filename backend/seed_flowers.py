from database import SessionLocal
from models import Flower

cactus_fact = "A flowering plant native to hot, dry areas with thick stems and sharp, needle-like points."

daisy_fact = "Two flowers in one: larger outer petals to make up one flower and a cluster of tiny petals that form the center 'eye' to make another."

tulip_fact = "A popular spring-blooming flower that grows from an underground bulb."

def seed_flowers():
    db = SessionLocal()

    try:
        flowers = [
            Flower(id=1, name="Cactus", fact=cactus_fact),
            Flower(id=2, name="Daisy", fact=daisy_fact),
            Flower(id=3, name="Tulip", fact=tulip_fact)
        ]

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