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
        print("Checking if 'full_body_photo_url' column exists in 'users' table...")
        
        # Check if column exists (MySQL specific syntax, adjust if using SQLite/Postgres)
        # Assuming MySQL based on connect_args={"charset": "utf8mb4"} in database.py
        try:
            result = conn.execute(text("SHOW COLUMNS FROM users LIKE 'full_body_photo_url'"))
            if result.fetchone():
                print("Column 'full_body_photo_url' already exists.")
                return
        except Exception as e:
            print(f"Error checking column (might be SQLite?): {e}")
            # Fallback for SQLite just in case, though settings suggest MySQL
            try:
                # SQLite doesn't support SHOW COLUMNS directly via SQL usually, PRAGMA table_info is used
                # But let's just try to add it and catch error if it exists
                pass 
            except:
                pass

        print("Adding 'full_body_photo_url' column...")
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN full_body_photo_url VARCHAR(255) NULL"))
            print("Migration successful.")
        except Exception as e:
            print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
