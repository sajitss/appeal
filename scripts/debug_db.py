import sqlite3

def run():
    conn = sqlite3.connect('db.sqlite3')
    cursor = conn.cursor()
    
    print("--- Columns in clinical_milestonetemplate ---")
    data = cursor.execute("PRAGMA table_info(clinical_milestonetemplate)")
    columns = [row[1] for row in data]
    print(columns)
    
    print("\n--- First 5 rows ---")
    rows = cursor.execute("SELECT * FROM clinical_milestonetemplate LIMIT 5")
    for row in rows:
        print(row)
        
    conn.close()

if __name__ == "__main__":
    run()
