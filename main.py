from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, session, render_template
from models import db, Location, Rating
from config import Config
import os
import pandas as pd
from functools import wraps
from sqlalchemy.sql import func
import re

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)

# Add a secret key for flask-login
app.secret_key = os.urandom(24)

# Simple admin credentials (in a real-world scenario, use a more secure method)
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "chipotle123"

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

def init_db():
    print("Starting database initialization...")
    try:
        with app.app_context():
            print("Creating database tables...")
            db.create_all()
            print("Database tables created successfully.")
            print("Importing California Chipotle stores...")
            import_california_chipotle_stores()
        print("Database initialization complete.")
    except Exception as e:
        print(f"Error during database initialization: {str(e)}")
        raise

def import_california_chipotle_stores():
    try:
        print("Starting import of California Chipotle stores...")
        df = pd.read_csv('chipotle_stores.csv')
        print(f"CSV file loaded. Total rows: {len(df)}")
        california_df = df[df['state'] == 'California']
        print(f"California stores found: {len(california_df)}")
        for _, row in california_df.iterrows():
            existing_location = Location.query.filter_by(
                latitude=float(row['latitude']),
                longitude=float(row['longitude'])
            ).first()
            if not existing_location:
                try:
                    street_name = extract_street_name(row['address'])
                    location = Location(
                        name=f"Chipotle - {street_name}",
                        address=f"{row['address']}, {row['location']}, {row['state']}",
                        latitude=float(row['latitude']),
                        longitude=float(row['longitude'])
                    )
                    db.session.add(location)
                    print(f"Adding location: {location.name}, {location.address}, {location.latitude}, {location.longitude}")
                except Exception as e:
                    print(f"Error adding location: {str(e)}")
                    print(f"Row data: {row}")
        db.session.commit()
        print("California Chipotle stores imported successfully.")
    except Exception as e:
        print(f"Error importing California Chipotle stores: {str(e)}")
        db.session.rollback()

def extract_street_name(address):
    # Remove any apartment/suite numbers
    address = re.sub(r'\b(Ste|Apt|Unit|#)\s*\d+', '', address, flags=re.IGNORECASE)
    
    # Split the address into words
    words = address.split()
    
    # Remove the street number (assuming it's the first word and numeric)
    if words and words[0].isdigit():
        words = words[1:]
    
    # Find the last word that could be a street type
    street_types = ['St', 'Ave', 'Rd', 'Road', 'Blvd', 'Dr', 'Ln', 'Way', 'Pl', 'Ct']
    last_street_word_index = next((i for i, word in enumerate(words) 
                                   if word.rstrip('.') in street_types), len(words))
    
    # Join the words up to and including the street type
    street_name = ' '.join(words[:last_street_word_index + 1])
    
    return street_name.strip()

# Move existing root route to '/app'
@app.route('/app')
def app_main():
    return render_template('index.html')

# Add new root route for landing page
@app.route('/')
def landing():
    return render_template('landing.html')

# Add route to handle signup
@app.route('/signup', methods=['POST'])
def signup():
    email = request.form.get('email')
    # TODO: Add email to waitlist storage
    return redirect('/thank-you')

# Optionally, add thank-you page route
@app.route('/thank-you')
def thank_you():
    return render_template('thank_you.html')

@app.route('/api/locations')
def get_locations():
    try:
        locations = db.session.query(Location, func.avg(Rating.cleanliness + Rating.friendliness + Rating.portion_size + 
                                                        Rating.speed_of_service + Rating.food_quality + Rating.value_for_money).label('average_rating')) \
            .outerjoin(Rating) \
            .group_by(Location.id) \
            .all()
        
        result = [{
            'id': location.id,
            'name': location.name,
            'address': location.address,
            'latitude': location.latitude,
            'longitude': location.longitude,
            'average_rating': float(average_rating) if average_rating else None
        } for location, average_rating in locations]
        
        return jsonify(result)
    except Exception as e:
        print(f"Error in get_locations: {str(e)}")
        return jsonify({'error': 'An error occurred while fetching locations'}), 500

@app.route('/api/locations/<int:location_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
def manage_location(location_id):
    location = Location.query.get_or_404(location_id)

    if request.method == 'GET':
        average_rating = db.session.query(func.avg(
            Rating.cleanliness + Rating.friendliness + Rating.portion_size + 
            Rating.speed_of_service + Rating.food_quality + Rating.value_for_money
        ) / 6).filter(Rating.location_id == location_id).scalar()
        
        return jsonify({
            'id': location.id,
            'name': location.name,
            'address': location.address,
            'latitude': location.latitude,
            'longitude': location.longitude,
            'average_rating': float(average_rating) if average_rating else None
        })

    elif request.method == 'PUT':
        data = request.json
        location.name = data['name']
        location.address = data['address']
        location.latitude = data['latitude']
        location.longitude = data['longitude']
        db.session.commit()
        return jsonify({'message': 'Location updated successfully'}), 200

    elif request.method == 'DELETE':
        db.session.delete(location)
        db.session.commit()
        return jsonify({'message': 'Location deleted successfully'}), 200

@app.route('/api/locations', methods=['POST'])
@login_required
def add_location():
    data = request.json
    new_location = Location(
        name=data['name'],
        address=data['address'],
        latitude=data['latitude'],
        longitude=data['longitude']
    )
    db.session.add(new_location)
    db.session.commit()
    return jsonify({'message': 'Location added successfully', 'id': new_location.id}), 201

@app.route('/api/ratings', methods=['POST'])
def add_rating():
    data = request.json
    new_rating = Rating(
        location_id=data['location_id'],
        cleanliness=data['cleanliness'],
        friendliness=data['friendliness'],
        portion_size=data['portion_size'],
        speed_of_service=data['speed_of_service'],
        food_quality=data['food_quality'],
        value_for_money=data['value_for_money']
    )
    db.session.add(new_rating)
    db.session.commit()
    return jsonify({'message': 'Rating added successfully', 'id': new_rating.id}), 201

@app.route('/location/<int:location_id>')
def location_details(location_id):
    try:
        location = Location.query.get_or_404(location_id)
        average_rating = db.session.query(func.avg(
            (Rating.cleanliness + Rating.friendliness + Rating.portion_size + 
             Rating.speed_of_service + Rating.food_quality + Rating.value_for_money) / 6
        )).filter(Rating.location_id == location_id).scalar()
        
        return render_template('location_details.html', location=location, average_rating=average_rating)
    except Exception as e:
        print(f"Error in location_details: {str(e)}")
        return jsonify({'error': 'An error occurred while fetching location details'}), 500

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['logged_in'] = True
            flash('Logged in successfully!', 'success')
            return redirect(url_for('admin'))
        else:
            flash('Invalid credentials. Please try again.', 'error')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('Logged out successfully!', 'success')
    return redirect(url_for('index'))

@app.route('/api/check_login')
def check_login():
    return jsonify({'logged_in': 'logged_in' in session})

@app.route('/admin')
@login_required
def admin():
    locations = Location.query.all()
    return render_template('admin.html', locations=locations)

@app.route('/admin/add_location', methods=['GET', 'POST'])
@login_required
def add_location_form():
    if request.method == 'POST':
        new_location = Location(
            name=request.form['name'],
            address=request.form['address'],
            latitude=float(request.form['latitude']),
            longitude=float(request.form['longitude'])
        )
        db.session.add(new_location)
        db.session.commit()
        flash('New location added successfully!', 'success')
        return redirect(url_for('admin'))
    return render_template('add_location.html')

@app.route('/debug/db')
def debug_db():
    try:
        locations = Location.query.all()
        return jsonify({
            'message': 'Database is accessible',
            'location_count': len(locations)
        })
    except Exception as e:
        return jsonify({
            'error': 'Database error',
            'message': str(e)
        }), 500

@app.route('/debug/locations')
def debug_locations():
    locations = Location.query.all()
    return jsonify([{
        'id': loc.id,
        'name': loc.name,
        'address': loc.address,
        'latitude': loc.latitude,
        'longitude': loc.longitude
    } for loc in locations])

if __name__ == '__main__':
    print("Starting application...")
    init_db()
    print("Database initialized, starting Flask server...")
    app.run(host='0.0.0.0', port=os.environ.get('PORT', 5001), ssl_context=('cert.pem', 'key.pem'))  # Use HTTPS
