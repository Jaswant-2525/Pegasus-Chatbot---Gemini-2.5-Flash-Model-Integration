# Pegasus Chatbot - Gemini 2.5 Flash Model Integration

A Django-based AI chatbot application powered by Google's Gemini 2.5 Flash model. Pegasus provides an intuitive chat interface with session management, user authentication, and real-time AI responses.

## Features

- **AI-Powered Chat**: Integrated with Google's Gemini 2.5 Flash model for intelligent conversations
- **User Authentication**: Secure login/signup system with Django's built-in auth
- **Chat Sessions**: Create, manage, and switch between multiple chat sessions
- **Chat History**: Persistent message storage with full conversation history
- **Responsive Design**: Modern UI with clean, user-friendly interface

## Tech Stack

- **Backend**: Django (Python)
- **AI Model**: Google Gemini 2.5 Flash
- **Database**: SQLite (development)
- **Frontend**: HTML, CSS, JavaScript

## Installation

### Prerequisites

- Python 3.8+
- Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Jaswant-2525/Pegasus-Chatbot---Gemini-2.5-Flash-Model-Integration.git
   cd Pegasus-Chatbot---Gemini-2.5-Flash-Model-Integration
   ```

2. **Create a virtual environment**

   ```bash
   python -m venv venv

   # Windows
   venv\Scripts\activate

   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install django google-genai
   ```

4. **Configure environment variables**

   ```bash
   # Copy the example env file
   cp .env.example .env

   # Edit .env and add your Gemini API key
   GEMINI_API_KEY=your_actual_api_key_here
   ```

5. **Update the API key in views.py**

   Open `main/views.py` and replace the placeholder API key with your actual key, or configure it to read from environment variables.

6. **Run migrations**

   ```bash
   python manage.py migrate
   ```

7. **Create a superuser (optional)**

   ```bash
   python manage.py createsuperuser
   ```

8. **Start the development server**

   ```bash
   python manage.py runserver
   ```

9. **Open in browser**
   ```
   http://127.0.0.1:8000/
   ```

## Project Structure

```
pegasus/
├── main/                   # Main application
│   ├── models.py          # ChatSession and Message models
│   ├── views.py           # View functions and API endpoints
│   ├── urls.py            # URL routing
│   ├── templates/         # HTML templates
│   │   └── main/
│   │       ├── home.html
│   │       ├── index.html # Chat interface
│   │       ├── login.html
│   │       └── about.html
│   └── static/            # CSS and JS files
│       └── main/
│           ├── css/
│           └── js/
├── pegasus/               # Project settings
│   ├── settings.py
│   └── urls.py
├── manage.py
├── .env.example           # Environment variables template
└── README.md
```

## API Endpoints

| Endpoint  | Method   | Description                     |
| --------- | -------- | ------------------------------- |
| `/`       | GET      | Home page                       |
| `/chat/`  | GET      | Chat interface (requires login) |
| `/about/` | GET      | About page                      |
| `/login/` | GET/POST | Login/Signup page               |

## Security Notes

⚠️ **Important**: Never commit your API keys to version control!

- Keep your Gemini API key in a `.env` file
- The `.gitignore` file is configured to exclude sensitive files
- Use environment variables in production

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

**Jaswant**

---

Made with ❤️ using Django and Google Gemini AI
