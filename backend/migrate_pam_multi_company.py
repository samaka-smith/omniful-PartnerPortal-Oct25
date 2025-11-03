"""
Migration script to add PAM multi-company assignment support and user fields
Run this after pulling the latest code
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
    
    # Check if users table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    if not cursor.fetchone():
        print("Users table doesn't exist yet. Will be created on first run.")
        conn.close()
        exit(0)
    
    # Add phone_number and photo_url to users table if not exists
    cursor.execute("PRAGMA table_info(users)")
    existing_columns = [row[1] for row in cursor.fetchall()]
    
    if 'phone_number' not in existing_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN phone_number VARCHAR(50)")
        print("✓ Added phone_number column to users table")
    else:
        print("- phone_number column already exists in users table")
    
    if 'photo_url' not in existing_columns:
        cursor.execute("ALTER TABLE users ADD COLUMN photo_url VARCHAR(500)")
        print("✓ Added photo_url column to users table")
    else:
        print("- photo_url column already exists in users table")
    
    # Create pam_company_assignments table if not exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='pam_company_assignments'")
    if not cursor.fetchone():
        cursor.execute("""
            CREATE TABLE pam_company_assignments (
                pam_id INTEGER NOT NULL,
                company_id INTEGER NOT NULL,
                assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (pam_id, company_id),
                FOREIGN KEY (pam_id) REFERENCES users(id),
                FOREIGN KEY (company_id) REFERENCES companies(id)
            )
        """)
        print("✓ Created pam_company_assignments table")
        
        # Migrate existing pam_id assignments from companies table
        cursor.execute("SELECT id, pam_id FROM companies WHERE pam_id IS NOT NULL")
        existing_assignments = cursor.fetchall()
        
        for company_id, pam_id in existing_assignments:
            try:
                cursor.execute("""
                    INSERT OR IGNORE INTO pam_company_assignments (pam_id, company_id)
                    VALUES (?, ?)
                """, (pam_id, company_id))
            except Exception as e:
                print(f"Warning: Could not migrate assignment for company {company_id}: {e}")
        
        if existing_assignments:
            print(f"✓ Migrated {len(existing_assignments)} existing PAM assignments")
    else:
        print("- pam_company_assignments table already exists")
    
    conn.commit()
    conn.close()
    
    print("\n✓ Migration completed successfully!")
        
except Exception as e:
    print(f"✗ Migration failed: {e}")
    exit(1)
