'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import MapContainer from '@/components/map/MapContainer'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { GoalEngine } from '@/components/goals/GoalEngine'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { Button } from '@/components/ui/button'
import { 
  Map, 
  MessageCircle, 
  Target, 
  BarChart3, 
  Settings,
  Search,
  Filter,
  Navigation,
  Compass,
  Heart,
  Shield,
  Leaf
} from 'lucide-react'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('map')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tabs = [
    { id: 'map', label: 'Map', icon: Map },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return (
          <div className="relative w-full h-full">
            <MapContainer />
          </div>
        )
      case 'dashboard':
        return <Dashboard />
      case 'goals':
        return <GoalEngine />
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <p className="text-muted-foreground">Settings page coming soon...</p>
          </div>
        )
      default:
        return (
          <div className="relative w-full h-full">
            <MapContainer />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-1 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Floating AI Assistant */}
      <AIAssistant />

      {/* Quick Actions Floating Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            className="rounded-full h-12 w-12 shadow-lg bg-primary hover:bg-primary/90"
            onClick={() => setActiveTab('map')}
          >
            <Navigation className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
