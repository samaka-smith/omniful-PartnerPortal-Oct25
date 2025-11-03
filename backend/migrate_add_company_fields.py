#!/usr/bin/env python3
"""
Migration script to add new fields to companies table
Run this script to update the database schema
"""

import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), 'instance', 'portal.db')

print(f"Connecting to database: {db_path}")

# Connect to the database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# List of new columns to add
new_columns = [
    ("company_type", "VARCHAR(50) DEFAULT 'Partner'"),
    ("logo_url", "VARCHAR(500)"),
    ("spoc_name", "VARCHAR(100)"),
    ("spoc_email", "VARCHAR(120)"),
    ("spoc_phone", "VARCHAR(50)"),
    ("country", "VARCHAR(100)"),
    ("serving_regions", "VARCHAR(500)"),
    ("partner_stage", "VARCHAR(50) DEFAULT 'Registered'"),
]

print("\nAdding new columns to companies table...")

for column_name, column_type in new_columns:
    try:
        # Check if column already exists
        cursor.execute(f"PRAGMA table_info(companies)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if column_name not in columns:
            cursor.execute(f"ALTER TABLE companies ADD COLUMN {column_name} {column_type}")
            print(f"✓ Added column: {column_name}")
        else:
            print(f"- Column already exists: {column_name}")
    except Exception as e:
        print(f"✗ Error adding {column_name}: {e}")

# Commit changes
conn.commit()
print("\n✅ Migration completed successfully!")

# Show updated table structure
print("\nUpdated companies table structure:")
cursor.execute("PRAGMA table_info(companies)")
for col in cursor.fetchall():
    print(f"  {col[1]}: {col[2]}")

conn.close()
