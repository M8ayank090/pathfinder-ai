# 🗺️ PathFinder AI - Smart Navigation Platform

> **AI-Powered Navigation for Life's Journey**  
> Build a smart web application that helps users make informed physical and life navigation decisions using AI, big data, and environmental context.

## 🎯 Core Features

### 🧠 AI-Personalized Route Finder
- **Smart Route Optimization**: Customize walking routes by safety, stress level, noise, greenery, etc.
- **Real-time Environmental Data**: AQI, weather, traffic, and safety metrics
- **Context-Aware Suggestions**: Personalized recommendations based on user preferences and goals

### 💬 Conversational AI Assistant
- **Integrated LLM-based Chatbot**: Natural language interaction for route planning
- **Smart Queries**: Ask questions like:
  - "Where should I go to feel relaxed?"
  - "What's the safest route to work?"
  - "Show me scenic walking paths"
  - "Find quiet places to work"

### 🎯 User Goal Engine
- **Lifestyle Goal Tracking**: Capture fitness, career growth, mindfulness goals
- **AI-Powered Recommendations**: Suggest daily habits, routes, or places
- **Progress Visualization**: Track achievements and streaks
- **Smart Habit Formation**: Automated habit suggestions based on goals

### 📊 Location-Aware Insights
- **Environmental Data Integration**: AQI, weather, crime stats
- **Context-Aware Alerts**: "Avoid this path after 9 PM"
- **Real-time Updates**: Live environmental and safety data
- **Historical Analytics**: Track patterns and improvements

### 🎨 Progressive, Responsive UI
- **PWA-Ready Design**: Installable progressive web app
- **Mobile-First UX**: Optimized for all devices
- **Modern Interface**: Beautiful, accessible components
- **Dark/Light Mode**: Theme support

## 🛠️ Tech Stack

### Frontend (Next.js App Router)
| Layer | Tool | Purpose |
|-------|------|---------|
| Framework | Next.js (App Router) | SSR, routing, fast performance |
| UI Library | shadcn/ui | Accessible, beautiful components |
| Styling | Tailwind CSS + Framer Motion | Modern design + animation |
| Maps | Leaflet.js + OpenStreetMap | Interactive route rendering (Free) |
| State Management | Zustand | Scalable, lightweight global store |
| Form Handling | React Hook Form | For goal input, onboarding |
| Data Fetching | React Query/SWR | API calls with caching |
| Charts | Custom Components | User insight visualizations |
| Auth | NextAuth.js | Social login + secure sessions |
| AI Assistant UI | Custom component | ChatGPT-style experience |

### Backend (FastAPI)
| Layer | Tool | Purpose |
|-------|------|---------|
| Server Framework | FastAPI (Python) | Build RESTful APIs, integrate ML |
| Database | SQLite (Development) | Structured + geo-location data |
| AI Models | OpenAI API, HuggingFace | LLMs + NLP + recommendations |
| Recommender System | Custom algorithms | Hybrid personalized suggestions |
| Environment APIs | OpenWeatherMap, IQAir | Real-time environmental data |
| Auth | JWT | Backend user session management |
| Hosting | Local Development | Deploy backend APIs |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pathfinder-ai
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

3. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

4. **Environment Variables**
Create `.env.local` in frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Running the Application

1. **Start Backend** (Terminal 1)
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

<img width="1918" height="965" alt="image" src="https://github.com/user-attachments/assets/eef7a1ba-29f4-4e26-8f42-f554619a42a0" />

2. **Start Frontend** (Terminal 2)
```bash
cd frontend
npm run dev
```
<img width="1918" height="968" alt="image" src="https://github.com/user-attachments/assets/380d5893-3ec8-41f4-817b-b34419898e18" />
3. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📱 Features Overview

### 🗺️ Interactive Map
- **Real-time Map**: OpenStreetMap integration with Leaflet.js
- **Route Visualization**: Multiple route options with safety/environmental scores
- **Environmental Overlay**: AQI, weather, and safety indicators
- **Interactive Markers**: Click for detailed information
- **Route Comparison**: Compare different routes side-by-side
  
### 🤖 AI Assistant
- **Natural Language Processing**: Understand complex queries
- **Context-Aware Responses**: Personalized recommendations
- **Quick Suggestions**: Pre-built queries for common needs
- **Voice Input**: Speech-to-text integration (ready for implementation)
- **Conversation History**: Persistent chat sessions
<img width="471" height="844" alt="image" src="https://github.com/user-attachments/assets/6bb53860-cc81-434b-adf0-ed7829cb27af" />

### 🎯 Goal Engine
- **Goal Categories**: Fitness, Wellness, Productivity, Social, Learning, Mindfulness
- **Progress Tracking**: Visual progress bars and statistics
- **Habit Formation**: Daily/weekly habit tracking
- **AI Suggestions**: Smart recommendations for goal achievement
- **Achievement System**: Gamified progress with badges and rewards

### 📊 Dashboard Analytics
- **Performance Metrics**: Distance, safety scores, environmental impact
- **Weekly Progress**: Visual charts and trends
- **Achievement Tracking**: Unlocked badges and milestones
- **AI Insights**: Personalized recommendations and trends
- **Favorite Areas**: Most visited and preferred locations
<img width="1918" height="910" alt="image" src="https://github.com/user-attachments/assets/abfb688f-a7bb-46a1-b5a8-5182150fdf7e" />

### 🔔 Smart Notifications
- **Route Completion**: Celebrate achievements
- **Environmental Alerts**: Air quality and weather warnings
- **Goal Reminders**: Keep users on track
- **Safety Updates**: Real-time safety information
- **Personalized Insights**: AI-generated recommendations

## 🏗️ Architecture

### Frontend Structure
```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # Reusable UI components
│   │   ├── ai/             # AI Assistant components
│   │   ├── dashboard/      # Analytics and insights
│   │   ├── goals/          # Goal tracking system
│   │   ├── layout/         # Header, sidebar, navigation
│   │   ├── map/            # Interactive map components
│   │   └── ui/             # Base UI components (shadcn/ui)
│   ├── lib/                # Utilities and configurations
│   └── styles/             # Global styles
```

### Backend Structure
```
backend/
├── app/
│   ├── api/                # FastAPI routes
│   │   └── v1/
│   │       └── endpoints/  # API endpoints
│   ├── core/               # Core configurations
│   ├── models/             # Database models
│   ├── schemas/            # Pydantic schemas
│   └── services/           # Business logic
├── main.py                 # FastAPI application entry
└── requirements.txt        # Python dependencies
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=PathFinder AI
```

**Backend (.env)**
```env
DATABASE_URL=sqlite:///./pathfinder_ai.db
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
OPENWEATHER_API_KEY=your-openweather-api-key
```

### Database Setup
```bash
cd backend
python -c "from app.core.database import engine; from app.models import Base; Base.metadata.create_all(bind=engine)"
```

## 🎨 UI Components

### Design System
- **shadcn/ui**: Modern, accessible components
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Beautiful, consistent iconography
- **Responsive Design**: Mobile-first approach

### Key Components
- **MapContainer**: Interactive map with route visualization
- **AIAssistant**: Conversational AI interface
- **GoalEngine**: Goal tracking and habit formation
- **Dashboard**: Analytics and insights
- **Header**: Navigation and user profile

## 🔌 API Endpoints

### Core Endpoints
- `GET /api/v1/goals/` - Get user goals
- `POST /api/v1/goals/` - Create new goal
- `PUT /api/v1/goals/{id}` - Update goal
- `GET /api/v1/ai/chat` - AI conversation
- `GET /api/v1/routes/` - Get route suggestions
- `POST /api/v1/routes/` - Create custom route

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/profile` - Get user profile

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Railway/Render)
```bash
cd backend
# Deploy to Railway or Render
# Set environment variables
# Configure database
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenStreetMap**: Free map data
- **Leaflet.js**: Interactive maps
- **shadcn/ui**: Beautiful UI components
- **FastAPI**: Modern Python web framework
- **Next.js**: React framework for production


**Built with ❤️ for smarter navigation** 
