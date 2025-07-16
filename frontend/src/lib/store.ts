import { create } from 'zustand'

interface RoutePreferences {
  stressLevel: 'low' | 'medium' | 'high'
  safety: 'low' | 'medium' | 'high'
  greenery: 'low' | 'medium' | 'high'
  noise: 'low' | 'medium' | 'high'
}

interface Goal {
  id: string
  title: string
  category: string
  progress: number
  active: boolean
}

interface PathFinderStore {
  // User preferences
  preferences: RoutePreferences
  updatePreferences: (prefs: Partial<RoutePreferences>) => void
  
  // Goals
  goals: Goal[]
  addGoal: (goal: Omit<Goal, 'id'>) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  removeGoal: (id: string) => void
  
  // Current location and route
  currentLocation: { lat: number; lng: number } | null
  setCurrentLocation: (location: { lat: number; lng: number }) => void
  
  // UI state
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  
  // AI Assistant
  aiMessages: Array<{
    id: string
    content: string
    sender: 'user' | 'ai'
    timestamp: Date
  }>
  addMessage: (message: { content: string; sender: 'user' | 'ai' }) => void
}

export const usePathFinderStore = create<PathFinderStore>((set, get) => ({
  // Initial preferences
  preferences: {
    stressLevel: 'low',
    safety: 'high',
    greenery: 'medium',
    noise: 'low',
  },
  
  updatePreferences: (prefs) => 
    set((state) => ({
      preferences: { ...state.preferences, ...prefs }
    })),
  
  // Initial goals
  goals: [
    {
      id: '1',
      title: 'Morning Mindfulness',
      category: 'Wellness',
      progress: 75,
      active: true,
    },
    {
      id: '2',
      title: 'Daily Steps',
      category: 'Fitness',
      progress: 60,
      active: true,
    },
    {
      id: '3',
      title: 'Creative Inspiration',
      category: 'Productivity',
      progress: 45,
      active: true,
    },
  ],
  
  addGoal: (goal) => 
    set((state) => ({
      goals: [...state.goals, { ...goal, id: Date.now().toString() }]
    })),
    
  updateGoal: (id, updates) =>
    set((state) => ({
      goals: state.goals.map(goal => 
        goal.id === id ? { ...goal, ...updates } : goal
      )
    })),
    
  removeGoal: (id) =>
    set((state) => ({
      goals: state.goals.filter(goal => goal.id !== id)
    })),
  
  // Location
  currentLocation: null,
  setCurrentLocation: (location) => set({ currentLocation: location }),
  
  // UI
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  // AI Messages
  aiMessages: [
    {
      id: '1',
      content: "Hi! I'm your AI navigation assistant. Ask me about routes, places, or anything related to your journey!",
      sender: 'ai',
      timestamp: new Date(),
    },
  ],
  
  addMessage: (message) =>
    set((state) => ({
      aiMessages: [
        ...state.aiMessages,
        {
          id: Date.now().toString(),
          content: message.content,
          sender: message.sender,
          timestamp: new Date(),
        },
      ],
    })),
})) 