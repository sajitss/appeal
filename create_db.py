import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_db():
    # User credentials
    user = 'postgres'
    password = 'admin'
    host = 'localhost'
    port = '5432'
    
    dbname = 'appeal_db'
    
    try:
        # Connect to default 'postgres' database to create new db
        con = psycopg2.connect(dbname='postgres', user=user, host=host, password=password, port=port)
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = con.cursor()
        
        # Check if exists
        cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{dbname}'")
        exists = cur.fetchone()
        
        if not exists:
            print(f"Creating database {dbname}...")
            cur.execute(f"CREATE DATABASE {dbname}")
            print(f"Database {dbname} created successfully.")
        else:
            print(f"Database {dbname} already exists.")
            
        cur.close()
        con.close()
        
    except Exception as e:
        print(f"Error: {e}")
        # Try with user 'admin' if 'postgres' fails
        if 'password authentication failed' in str(e) and user == 'postgres':
             print("Retrying with user 'admin'...")
             try:
                con = psycopg2.connect(dbname='postgres', user='admin', host=host, password=password, port=port)
                con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
                cur = con.cursor()
                cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{dbname}'")
                if not cur.fetchone():
                    cur.execute(f"CREATE DATABASE {dbname}")
                    print(f"Database {dbname} created successfully with user 'admin'.")
                cur.close()
                con.close()
             except Exception as e2:
                 print(f"Retry failed: {e2}")

if __name__ == '__main__':
    create_db()
