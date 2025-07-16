# Pathfinder AI Backend

A robust FastAPI backend for the Pathfinder AI navigation platform, providing AI-powered, context-aware, and purpose-driven navigation and analytics services.

---

## 🚀 Features

- **User Management**: Registration, authentication, profile, and preferences
- **Route Management**: Create, track, and manage navigation routes with AI recommendations
- **Map Services**: Free OpenStreetMap and OSRM integration for place search and route calculation
- **Goal System**: Set and track personal goals with progress and streaks
- **AI Assistant**: Conversational AI for navigation and recommendations
- **Achievements**: Gamification with badges and progress tracking
- **Dashboard & Analytics**: Insights and user statistics
- **JWT Auth**: Secure, token-based authentication
- **Async SQLAlchemy**: Fast, async database access
- **Pydantic Validation**: Strong request/response validation
- **OpenAPI Docs**: Auto-generated API documentation

---

## 🛠️ Tech Stack

- **Framework**: FastAPI
- **Database**: SQLAlchemy (async) + SQLite
- **Auth**: JWT (python-jose), bcrypt (passlib)
- **Validation**: Pydantic
- **Docs**: OpenAPI/Swagger
- **Dev Tools**: uvicorn, pytest, black, isort

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── api.py
│   │       └── endpoints/
│   │           ├── users.py
│   │           ├── routes.py
│   │           ├── goals.py
│   │           ├── ai.py
│   │           ├── dashboard.py
│   │           └── map.py
│   ├── core/
│   ├── models/
│   ├── schemas/
│   └── services/
├── main.py
├── requirements.txt
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Python 3.8+
- pip

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/M8ayank090/PathfinderAI.git
   cd PathfinderAI/backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   SECRET_KEY=your-secret-key-here
   OPENAI_API_KEY=your-openai-api-key
   OPENWEATHER_API_KEY=your-weather-api-key
   ```
   *Map services use free OpenStreetMap and OSRM APIs - no API keys required!*

5. **Run the application**
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at [http://localhost:8000](http://localhost:8000)

---

## 📚 API Documentation

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI Schema**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## 🔐 Authentication

- Register: `POST /api/v1/users/register`
- Login: `POST /api/v1/users/login`
- Use the returned JWT token in `Authorization: Bearer <token>` header for protected endpoints.

---

## 🗺️ Map Services

- **OpenStreetMap Nominatim**: Free, global place search and geocoding
- **OSRM**: Free, real-time route calculation (walking, cycling, driving)
- **No API keys required**

---

## 🧑‍💻 Contributing

1. Fork the repo and clone your fork.
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -am 'Add new feature'`
4. Push to your fork: `git push origin feature/your-feature`
5. Open a Pull Request on GitHub.

---

## 🐞 Troubleshooting

- **Port already in use**: Change the port in the `uvicorn` command.
- **Database errors**: Delete `pathfinder_ai.db` and restart, or check your `.env` config.
- **Module not found**: Ensure your virtual environment is activated and dependencies are installed.
- **Type errors**: Ensure you are using the correct Python version and have all dependencies installed.

---

## 📬 Contact

For questions, issues, or feature requests, open an issue on [GitHub](https://github.com/M8ayank090/PathfinderAI) or contact the maintainer.

---

## ⭐ Credits

- Built with [FastAPI](https://fastapi.tiangolo.com/), [SQLAlchemy](https://www.sqlalchemy.org/), [Pydantic](https://pydantic-docs.helpmanual.io/), and [OpenStreetMap](https://www.openstreetmap.org/).
- Open source and free for all use cases. 