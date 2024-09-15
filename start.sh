#!/bin/bash
echo "Starting Chipotle Maps..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Verify we're in the virtual environment
if [ "$VIRTUAL_ENV" = "" ]; then
    echo "Failed to activate virtual environment. Exiting."
    exit 1
fi

echo "Successfully activated virtual environment: $VIRTUAL_ENV"

# Install or upgrade pip
echo "Upgrading pip..."
"$VIRTUAL_ENV/bin/pip" install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
"$VIRTUAL_ENV/bin/pip" install -r requirements.txt

# Verify Flask and Flask-SQLAlchemy installation
if ! "$VIRTUAL_ENV/bin/python" -c "import flask, flask_sqlalchemy" &> /dev/null; then
    echo "Flask or Flask-SQLAlchemy not found, installing..."
    "$VIRTUAL_ENV/bin/pip" install flask flask_sqlalchemy
fi

# Set the FLASK_APP environment variable
export FLASK_APP=main.py

# Initialize the database
echo "Initializing database..."
"$VIRTUAL_ENV/bin/python" -c "from main import app, db, init_db; app.app_context().push(); db.create_all(); init_db()"

# Start the Flask application
echo "Starting Flask application..."
"$VIRTUAL_ENV/bin/python" main.py