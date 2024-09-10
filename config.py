import os

class Config:
    db_url = os.environ.get('DATABASE_URL')
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    # Extract the endpoint ID from the host
    host = os.environ.get('PGHOST', '')
    endpoint_id = host.split('.')[0] if '.' in host else ''
    
    # Construct the new database URL with the endpoint ID and SSL mode
    SQLALCHEMY_DATABASE_URI = f"{db_url}?options=endpoint%3D{endpoint_id}&sslmode=require"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.urandom(24)
