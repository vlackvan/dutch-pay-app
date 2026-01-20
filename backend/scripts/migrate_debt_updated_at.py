import sys
import os
from sqlalchemy import create_engine, text

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings

def migrate():
    print(f"Connecting to database: {settings.DATABASE_URL}")
    engine = create_engine(settings.DATABASE_URL)

    with engine.connect() as conn:
        print("Checking if 'debt_updated_at' column exists in 'settlement_results' table...")

        # Check if column exists (MySQL specific)
        try:
            result = conn.execute(text("SHOW COLUMNS FROM settlement_results LIKE 'debt_updated_at'"))
            if result.fetchone():
                print("Column 'debt_updated_at' already exists.")
                return
        except Exception as e:
            print(f"Error checking column: {e}")
            return

        print("Adding 'debt_updated_at' column to settlement_results table...")
        try:
            conn.execute(text("ALTER TABLE settlement_results ADD COLUMN debt_updated_at DATETIME NULL"))
            conn.commit()
            print("Migration successful!")
            print("\nNOTE: For existing settlement results, debt_updated_at will be NULL.")
            print("The badge system will fall back to using created_at for these records.")
            print("New calculations will populate debt_updated_at automatically.")
        except Exception as e:
            print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
