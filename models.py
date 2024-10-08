from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func

db = SQLAlchemy()

class Location(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    ratings = db.relationship('Rating', backref='location', lazy=True)
    
    __table_args__ = (db.UniqueConstraint('name', 'address', name='unique_location'),)

    def to_dict(self, include_ratings=False):
        data = {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'latitude': float(self.latitude),
            'longitude': float(self.longitude),
        }
        if include_ratings:
            ratings = Rating.query.filter_by(location_id=self.id).all()
            data['ratings'] = [rating.to_dict() for rating in ratings]
            data['average_rating'] = sum(r.average for r in ratings) / len(ratings) if ratings else 0
        return data

class Rating(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    location_id = db.Column(db.Integer, db.ForeignKey('location.id'), nullable=False)
    cleanliness = db.Column(db.Integer, nullable=False)
    friendliness = db.Column(db.Integer, nullable=False)
    portion_size = db.Column(db.Integer, nullable=False)
    speed_of_service = db.Column(db.Integer, nullable=False)
    food_quality = db.Column(db.Integer, nullable=False)
    value_for_money = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    @property
    def average(self):
        return (self.cleanliness + self.friendliness + self.portion_size + 
                self.speed_of_service + self.food_quality + self.value_for_money) / 6

    def to_dict(self):
        return {
            'id': self.id,
            'cleanliness': self.cleanliness,
            'friendliness': self.friendliness,
            'portion_size': self.portion_size,
            'speed_of_service': self.speed_of_service,
            'food_quality': self.food_quality,
            'value_for_money': self.value_for_money,
            'created_at': self.created_at.isoformat(),
            'average': self.average
        }
