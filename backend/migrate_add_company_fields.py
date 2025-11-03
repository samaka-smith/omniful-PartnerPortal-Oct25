"""
Migration script to add new fields to companies table
Run this after pulling the latest code and before starting the app
"""
import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), 'instance', 'portal.db')

# Create instance directory if it doesn't exist
os.makedirs(os.path.dirname(db_path), exist_ok=True)

# Check if database exists
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    print("The database will be created automatically when you start the application.")
    print("No migration needed for new installations.")
    exit(0)

print(f"Connecting to database: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if companies table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='companies'")
    if not cursor.fetchone():
        print("Companies table doesn't exist yet. Will be created on first run.")
        conn.close()
        exit(0)
    
    # Get existing columns
    cursor.execute("PRAGMA table_info(companies)")
    existing_columns = [row[1] for row in cursor.fetchall()]
    
    # Define new columns to add
    new_columns = {
        'company_type': 'VARCHAR(100)',
        'logo_url': 'VARCHAR(500)',
        'spoc_name': 'VARCHAR(200)',
        'spoc_email': 'VARCHAR(200)',
        'spoc_phone': 'VARCHAR(50)',
        'country': 'VARCHAR(100)',
        'serving_regions': 'TEXT',
        'partner_stage': 'VARCHAR(100)',
        'published_on_website': 'BOOLEAN DEFAULT 0',
        'assigned_pam_id': 'INTEGER'
    }
    
    # Add missing columns
    added_count = 0
    for column_name, column_type in new_columns.items():
        if column_name not in existing_columns:
            try:
                cursor.execute(f"ALTER TABLE companies ADD COLUMN {column_name} {column_type}")
                print(f"✓ Added column: {column_name}")
                added_count += 1
            except sqlite3.OperationalError as e:
                print(f"✗ Failed to add {column_name}: {e}")
        else:
            print(f"- Column already exists: {column_name}")
    
    conn.commit()
    conn.close()
    
    if added_count > 0:
        print(f"\n✓ Migration completed successfully! Added {added_count} new columns.")
    else:
        print("\n✓ All columns already exist. No migration needed.")
        
except Exception as e:
    print(f"✗ Migration failed: {e}")
    exit(1)
