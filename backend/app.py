from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests
from supabase import create_client, Client
from datetime import datetime, timedelta
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from google.auth.transport import requests
import json

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Initialize Supabase
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_ANON_KEY')
)

# Configure Google OAuth
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your-secret-key')  # Change this in production
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'  # Only for development

CLIENT_SECRETS = {
    "web": {
        "client_id": os.getenv('GOOGLE_CLIENT_ID'),
        "client_secret": os.getenv('GOOGLE_CLIENT_SECRET'),
        "redirect_uris": ["http://localhost:3000/auth/callback"],
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token"
    }
}

# Create a Flow object
flow = Flow.from_client_config(
    client_config=CLIENT_SECRETS,
    scopes=[
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ],
    redirect_uri="http://localhost:3000/auth/callback"
)

class CalendlyService:
    def __init__(self):
        self.api_key = os.getenv('CALENDLY_API_KEY')
        self.user_uri = os.getenv('CALENDLY_USER_URI')
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

    def get_available_slots(self, start_time, end_time):
        try:
            response = requests.get(
                'https://api.calendly.com/scheduling_links',
                headers=self.headers,
                params={
                    'organization': self.user_uri,
                    'count': 100
                }
            )
            response.raise_for_status()
            return response.json()['collection']
        except Exception as e:
            print(f"Error fetching Calendly slots: {str(e)}")
            raise

    def create_booking(self, email, date_time):
        try:
            response = requests.post(
                'https://api.calendly.com/scheduled_events',
                headers=self.headers,
                json={
                    'event_type': f'{self.user_uri}/30min',  # Updated to 30min
                    'start_time': date_time,
                    'email': email,
                    'name': email.split('@')[0],
                    'timezone': 'UTC'
                }
            )
            response.raise_for_status()
            data = response.json()['resource']
            return {
                'id': data['id'],
                'join_url': data.get('location', {}).get('join_url'),
                'start_time': data['start_time'],
                'end_time': data['end_time']
            }
        except Exception as e:
            print(f"Error creating Calendly booking: {str(e)}")
            raise

calendly_service = CalendlyService()

@app.route('/api/available-slots', methods=['GET'])
def get_available_slots():
    try:
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        
        # Get available slots from Calendly
        available_slots = calendly_service.get_available_slots(start_date, end_date)
        
        # Get booked slots from Supabase
        booked_slots = supabase.table('bookings')\
            .select('dateTime')\
            .gte('dateTime', start_date)\
            .lte('dateTime', end_date)\
            .neq('status', 'cancelled')\
            .execute()

        # Filter out booked slots
        booked_times = [booking['dateTime'] for booking in booked_slots.data]
        final_slots = [
            slot for slot in available_slots 
            if slot['start_time'] not in booked_times
        ]
        
        return jsonify(final_slots)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    try:
        data = request.json
        email = data.get('email')
        date_time = data.get('dateTime')

        if not email or not date_time:
            return jsonify({'error': 'Email and dateTime are required'}), 400

        # Check if slot is available
        existing_booking = supabase.table('bookings')\
            .select('*')\
            .eq('dateTime', date_time)\
            .neq('status', 'cancelled')\
            .execute()

        if existing_booking.data:
            return jsonify({'error': 'This time slot is no longer available'}), 400

        # Create Calendly event
        calendly_event = calendly_service.create_booking(email, date_time)

        # Create booking in Supabase
        booking = supabase.table('bookings')\
            .insert({
                'email': email,
                'dateTime': date_time,
                'status': 'confirmed',
                'calendlyEventId': calendly_event['id']
            })\
            .execute()

        return jsonify({
            'message': 'Booking confirmed successfully',
            'booking': booking.data[0],
            'joinUrl': calendly_event['join_url']
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/google')
def google_auth():
    authorization_url, state = flow.authorization_url()
    session['state'] = state
    return jsonify({"auth_url": authorization_url})

@app.route('/auth/callback')
def callback():
    try:
        flow.fetch_token(authorization_response=request.url)
        credentials = flow.credentials
        
        # Get user info from Google
        id_info = id_token.verify_oauth2_token(
            credentials.id_token,
            requests.Request(),
            CLIENT_SECRETS['web']['client_id']
        )
        
        # Store user info in session
        session['user'] = {
            'email': id_info.get('email'),
            'name': id_info.get('name'),
            'picture': id_info.get('picture')
        }
        
        return redirect('/book-session')
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/auth/user')
def get_user():
    user = session.get('user')
    if user:
        return jsonify(user)
    return jsonify({"error": "Not authenticated"}), 401

if __name__ == '__main__':
    app.run(port=5000, debug=True) 