from pathlib import Path
from database import SessionLocal
from models import Flowers

FLOWERS_DIR = Path(__file__).parent.parent / "frontend" / "src" / "assets" / "flowers"

def seed_flowers():
    db = SessionLocal()

    try:
        print("looking for svgs in:", FLOWERS_DIR)
        print("directory exists:", FLOWERS_DIR.exists())

        svg_files = list(FLOWERS_DIR.glob("*.svg"))
        print("svg files found:", len(svg_files))

        for svg_file in FLOWERS_DIR.glob("*.svg"):
            print("found:", svg_file)

            flower_name = svg_file.stem.replace("_", " ").title()

            flower = Flowers(
                name=flower_name,
                svg_path=f"assets/flowers/{svg_file.name}"
            )

            db.add(flower)

        db.commit()

        print("Flowers in database:")

        flowers = db.query(Flowers).all()

        for flower in flowers:
            print(f"{flower.id}: {flower.name} -> {flower.svg_path}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

if __name__ == "__main__":
    seed_flowers()