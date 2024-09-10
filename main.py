from flask import Flask, render_template, request, jsonify
from models import db, Location, Rating
from config import Config
import os

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/locations')
def get_locations():
    locations = Location.query.all()
    return jsonify([location.to_dict() for location in locations])

@app.route('/api/locations/<int:location_id>')
def get_location(location_id):
    location = Location.query.get_or_404(location_id)
    return jsonify(location.to_dict(include_ratings=True))

@app.route('/api/ratings', methods=['POST'])
def submit_rating():
    data = request.json
    new_rating = Rating(
        location_id=data['location_id'],
        portion_size=data['portion_size'],
        guacamole_availability=data['guacamole_availability'],
        cleanliness=data['cleanliness'],
        friendliness=data['friendliness']
    )
    db.session.add(new_rating)
    db.session.commit()
    return jsonify({'message': 'Rating submitted successfully'}), 201

@app.route('/location/<int:location_id>')
def location_details(location_id):
    location = Location.query.get_or_404(location_id)
    return render_template('location_details.html', location=location)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000)
