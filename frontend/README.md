# PathFinder AI Frontend

A modern, AI-powered navigation application built with Next.js 15, TypeScript, and Tailwind CSS.

## ✨ Features

### 🗺️ Interactive Map Interface
- Real-time route visualization with animated elements
- Search functionality with intelligent suggestions
- Weather and traffic integration
- Navigation controls with start/stop functionality
- Route optimization with AI-powered recommendations

### 🤖 AI Assistant
- Intelligent chat interface with voice input support
- Context-aware route recommendations
- Multiple message types (text, route suggestions, achievements)
- Quick question suggestions
- Real-time typing indicators

### 🎯 Goal Engine
- Comprehensive goal management system
- Achievement tracking with progress visualization
- Goal categories (Fitness, Wellness, Productivity, Social)
- Streak tracking and deadline management
- Interactive goal creation dialog

### 📊 Dashboard & Analytics
- Real-time statistics and insights
- Progress tracking across multiple metrics
- AI-powered insights and recommendations
- Recent activity feed
- Achievement showcase
- Time-based analytics (daily, weekly, monthly, yearly)

### ⚙️ Settings & Preferences
- Comprehensive user profile management
- Notification preferences
- Route optimization settings
- Privacy and security controls
- Theme customization (Light/Dark/System)
- Language and unit preferences
- Data management (export/import)

### 🎨 Modern UI/UX
- Responsive design with mobile-first approach
- Dark/Light theme support
- Smooth animations and transitions
- Glassmorphism design elements
- Accessibility-focused components
- Intuitive navigation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pathfinder-ai/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

### Core Technologies
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React 19** - Latest React with concurrent features

### UI Components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **Framer Motion** - Animation library
- **Class Variance Authority** - Component variant management

### State Management
- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **React Hook Form** - Form handling

### Additional Libraries
- **Next Themes** - Theme switching
- **Sonner** - Toast notifications
- **Zod** - Schema validation

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── settings/          # Settings page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ai/               # AI Assistant components
│   ├── dashboard/        # Dashboard components
│   ├── goals/            # Goal Engine components
│   ├── layout/           # Layout components
│   ├── map/              # Map components
│   ├── providers/        # Context providers
│   ├── settings/         # Settings components
│   └── ui/               # Reusable UI components
└── lib/                  # Utility functions
    ├── store.ts          # Zustand store
    └── utils.ts          # Helper functions
```

## 🎨 Design System

### Color Palette
- **Primary**: Modern blue tones
- **Secondary**: Neutral grays
- **Accent**: Purple and green for highlights
- **Success**: Green for positive actions
- **Warning**: Yellow for cautions
- **Error**: Red for errors

### Typography
- **Font**: Geist Sans (Primary), Geist Mono (Code)
- **Weights**: Regular, Medium, Semibold, Bold
- **Sizes**: Responsive scale from 12px to 48px

### Components
- **Cards**: Glassmorphism with backdrop blur
- **Buttons**: Multiple variants with hover states
- **Inputs**: Clean, accessible form controls
- **Modals**: Smooth overlay dialogs
- **Badges**: Status and category indicators

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Real APIs for Live Data (All Free!)
# No API keys required - uses open-source APIs

# OpenWeatherMap API (Optional - for enhanced weather data)
# Get your key at: https://openweathermap.org/api
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here

# World Air Quality Index API (Optional - for enhanced AQI data)
# Get your key at: https://aqicn.org/data-platform/token/
NEXT_PUBLIC_WAQI_API_KEY=your_waqi_api_key_here
```

**API Setup Instructions:**

### 1. **Free Open-Source APIs (No Setup Required)**
The app automatically uses these free APIs:
- **OpenStreetMap Nominatim** - For place search (FREE, no limits)
- **OSRM (Open Source Routing Machine)** - For route calculation (FREE, no limits)

### 2. **OpenWeatherMap API (Optional)**
1. Sign up at [openweathermap.org](https://openweathermap.org/api)
2. Get free API key (1000 calls/day)
3. Add to `.env.local` as `NEXT_PUBLIC_OPENWEATHER_API_KEY`

### 3. **World Air Quality Index API (Optional)**
1. Get free token at [aqicn.org](https://aqicn.org/data-platform/token/)
2. Add to `.env.local` as `NEXT_PUBLIC_WAQI_API_KEY`

### 4. **Fallback Behavior**
- **With Optional API Keys**: Enhanced weather and AQI data
- **Without API Keys**: Still works perfectly with free open-source APIs
- **All Features**: Place search, routing, and basic weather work without any keys

**Cost Information:**
- **OpenStreetMap**: Completely FREE (no limits)
- **OSRM**: Completely FREE (no limits)
- **OpenWeatherMap**: Free tier (1000 calls/day)
- **WAQI**: Free tier (1000 calls/day)
- **Total Cost**: $0 (completely free!)

### Tailwind Configuration
The project uses Tailwind CSS v4 with custom configuration for:
- Color system with CSS variables
- Custom animations
- Responsive breakpoints
- Component variants

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus management

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Join our community Discord

---

Built with ❤️ by the PathFinder AI Team
