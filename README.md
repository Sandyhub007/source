# Soul Connect

A culturally-sensitive mental health platform for NRIs (Non-Resident Indians) offering affordable, accessible peer support and professional counseling services.

## Features

- Gmail Authentication
- Calendly Integration for Session Booking
- Peer Moderator Profiles
- Responsive Design
- Cultural Context-Aware Support

## Tech Stack

- Frontend:
  - HTML5
  - Tailwind CSS
  - JavaScript
  - Calendly Widget Integration

- Backend:
  - Python
  - Flask
  - Google OAuth
  - Supabase

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/soulconnect.git
cd soulconnect
```

2. Install dependencies:
```bash
# Backend dependencies
cd backend
pip install -r requirements.txt

# Frontend dependencies
cd ..
```

3. Configure environment variables:
```bash
# Create .env file in backend directory
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
CALENDLY_API_KEY=your_calendly_api_key
```

4. Run the application:
```bash
# Start backend server
cd backend
python app.py

# Start frontend server
cd ..
python -m http.server 3000
```

5. Visit `http://localhost:3000` in your browser

## Project Structure

```
soulconnect/
├── backend/
│   ├── app.py
│   └── requirements.txt
├── index.html
├── styles/
│   └── main.css
├── scripts/
│   ├── main.js
│   └── analytics.js
└── assets/
    └── images/
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Vashisht - vashisht@therastudio.in