#!/usr/bin/env python3
"""
Database migration script
Adds new columns to existing tables
"""
import sqlite3
import os

# Get database path
db_path = os.path.join(os.getcwd(), 'src', 'database', 'app.db')

print(f"Migrating database: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Add columns to companies table
    print("Adding columns to companies table...")
    try:
        cursor.execute("ALTER TABLE companies ADD COLUMN published BOOLEAN DEFAULT 0")
        print("✅ Added 'published' column")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("⏭️  'published' column already exists")
        else:
            raise
    
    try:
        cursor.execute("ALTER TABLE companies ADD COLUMN tags TEXT")
        print("✅ Added 'tags' column")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("⏭️  'tags' column already exists")
        else:
            raise
    
    try:
        cursor.execute("ALTER TABLE companies ADD COLUMN pam_id INTEGER REFERENCES users(id)")
        print("✅ Added 'pam_id' column")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("⏭️  'pam_id' column already exists")
        else:
            raise
    
    # Add columns to deals table
    print("\nAdding columns to deals table...")
    try:
        cursor.execute("ALTER TABLE deals ADD COLUMN revenue_actual REAL")
        print("✅ Added 'revenue_actual' column")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("⏭️  'revenue_actual' column already exists")
        else:
            raise
    
    try:
        cursor.execute("ALTER TABLE deals ADD COLUMN proof_of_engagement TEXT")
        print("✅ Added 'proof_of_engagement' column")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("⏭️  'proof_of_engagement' column already exists")
        else:
            raise
    
    try:
        cursor.execute("ALTER TABLE deals ADD COLUMN proof_of_sale TEXT")
        print("✅ Added 'proof_of_sale' column")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("⏭️  'proof_of_sale' column already exists")
        else:
            raise
    
    # Create deal_notes table if it doesn't exist
    print("\nCreating deal_notes table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS deal_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            deal_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            note_text TEXT NOT NULL,
            note_type VARCHAR(50) DEFAULT 'general',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (deal_id) REFERENCES deals(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    print("✅ deal_notes table created/verified")
    
    conn.commit()
    print("\n✅ Database migration completed successfully!")
    
except Exception as e:
    print(f"\n❌ Migration failed: {e}")
    conn.rollback()
finally:
    conn.close()

