# Chipotle Rating App

This application allows users to view and rate Chipotle locations in California. It features an interactive map, location details, and an admin interface for managing locations.

## Features

- Interactive map showing Chipotle locations in California
- Detailed view for each location with ratings
- User rating system for various aspects of the Chipotle experience
- Admin interface for managing locations (add, edit, delete)
- HTTPS support for secure connections

## Tech Stack

- Backend: Flask (Python)
- Database: SQLite with SQLAlchemy ORM
- Frontend: HTML, CSS (Tailwind CSS), JavaScript
- Map: Leaflet.js
- Data: California Chipotle locations from CSV file

## Local Development Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd ChipotleScooperMap
   ```

2. Create a virtual environment and activate it:
   ```
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Ensure you have the `chipotle_stores.csv` file in the project root directory.

5. Generate SSL certificates for HTTPS:
   ```
   openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
   ```

6. Start the application:
   ```
   ./start.sh
   ```

7. Access the application at `https://localhost:5001`

## Admin Access

- Username: admin
- Password: chipotle123

## File Structure

- `main.py`: Main Flask application
- `models.py`: Database models
- `config.py`: Configuration settings
- `static/`: Static files (CSS, JavaScript)
- `templates/`: HTML templates
- `start.sh`: Startup script

## Notes

- The application uses HTTPS. Make sure to accept the self-signed certificate in your browser.
- The `chipotle_stores.csv` file is required for initial data import.
- Ensure all required Python packages are installed (see `requirements.txt`).

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.