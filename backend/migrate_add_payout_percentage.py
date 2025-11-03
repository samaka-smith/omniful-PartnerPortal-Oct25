"""
Migration script to add payout_percentage field to companies table
"""
import sqlite3
import os

# Get database path
db_path = os.path.join(os.path.dirname(__file__), 'instance', 'portal.db')

print(f"Connecting to database: {db_path}")

# Create instance directory if it doesn't exist
os.makedirs(os.path.dirname(db_path), exist_ok=True)

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if column already exists
    cursor.execute("PRAGMA table_info(companies)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'payout_percentage' not in columns:
        print("Adding payout_percentage column to companies table...")
        cursor.execute("""
            ALTER TABLE companies 
            ADD COLUMN payout_percentage REAL DEFAULT 0.0
        """)
        conn.commit()
        print("✓ Successfully added payout_percentage column")
    else:
        print("✓ payout_percentage column already exists")
    
except Exception as e:
    print(f"✗ Error: {e}")
    conn.rollback()
finally:
    conn.close()
    print("Migration complete!")
