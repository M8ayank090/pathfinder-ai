'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Search, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye,
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Shield,
  Leaf,
  Menu,
  X,
  ChevronDown,
  Star,
  Award,
  Activity,
  Heart
} from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  timestamp: Date
  read: boolean
}

interface EnvironmentalStatus {
  temperature: number
  humidity: number
  windSpeed: number
  visibility: number
  aqi: number
  weather: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy'
}

const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'Route Completed',
    message: 'Great job! You completed the Scenic Park Route with a safety score of 9.2/10.',
    type: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false
  },
  {
    id: '2',
    title: 'Environmental Alert',
    message: 'Air quality is moderate in your area. Consider routes through green spaces.',
    type: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false
  },
  {
    id: '3',
    title: 'Goal Achievement',
    message: 'Congratulations! You\'ve completed your weekly fitness goal.',
    type: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true
  },
  {
    id: '4',
    title: 'New Route Available',
    message: 'A new AI-optimized route has been added to your area.',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true
  }
]

const environmentalStatus: EnvironmentalStatus = {
  temperature: 28,
  humidity: 65,
  windSpeed: 12,
  visibility: 8,
  aqi: 45,
  weather: 'partly-cloudy'
}

const getWeatherIcon = (weather: EnvironmentalStatus['weather']) => {
  switch (weather) {
    case 'sunny': return <Sun className="h-4 w-4 text-yellow-500" />
    case 'cloudy': return <Cloud className="h-4 w-4 text-gray-500" />
    case 'rainy': return <CloudRain className="h-4 w-4 text-blue-500" />
    case 'partly-cloudy': return <Cloud className="h-4 w-4 text-gray-400" />
    default: return <Sun className="h-4 w-4 text-yellow-500" />
  }
}

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return 'text-green-500'
  if (aqi <= 100) return 'text-yellow-500'
  if (aqi <= 150) return 'text-orange-500'
  return 'text-red-500'
}

const getAQILabel = (aqi: number) => {
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
  return 'Unhealthy'
}

export function Header() {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const unreadNotifications = sampleNotifications.filter(n => !n.read).length

  const markAsRead = (notificationId: string) => {
    // In a real app, this would update the backend
    console.log('Marking notification as read:', notificationId)
  }

  const markAllAsRead = () => {
    // In a real app, this would update the backend
    console.log('Marking all notifications as read')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                PathFinder AI
              </h1>
              <p className="text-xs text-muted-foreground">Smart Navigation</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search destinations, routes, or places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
        </div>

        {/* Environmental Status */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            {getWeatherIcon(environmentalStatus.weather)}
            <div className="text-sm">
              <div className="font-medium">{environmentalStatus.temperature}°C</div>
              <div className="text-xs text-muted-foreground">{environmentalStatus.humidity}%</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <div className={`w-2 h-2 rounded-full ${getAQIColor(environmentalStatus.aqi)}`} />
            <div className="text-sm">
              <div className="font-medium">{environmentalStatus.aqi} AQI</div>
              <div className="text-xs text-muted-foreground">{getAQILabel(environmentalStatus.aqi)}</div>
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <Card className="absolute right-0 top-12 w-80 shadow-2xl border-0 bg-background/95 backdrop-blur">
                <CardContent className="p-0">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Notifications</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs"
                      >
                        Mark all read
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {sampleNotifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'success' ? 'bg-green-500' :
                            notification.type === 'warning' ? 'bg-yellow-500' :
                            notification.type === 'error' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {notification.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/user.png" alt="User" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">John Doe</div>
                <div className="text-xs text-muted-foreground">Level 5 Explorer</div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <Card className="absolute right-0 top-12 w-64 shadow-2xl border-0 bg-background/95 backdrop-blur">
                <CardContent className="p-0">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/avatars/user.png" alt="User" />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">John Doe</h3>
                        <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs">Level 5 Explorer</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <div className="text-lg font-bold text-primary">47</div>
                        <div className="text-xs text-muted-foreground">Routes</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <div className="text-lg font-bold text-green-500">12</div>
                        <div className="text-xs text-muted-foreground">Goals</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <div className="text-lg font-bold text-purple-500">8</div>
                        <div className="text-xs text-muted-foreground">Streak</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Award className="h-4 w-4 mr-2" />
                        Achievements
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Activity className="h-4 w-4 mr-2" />
                        Analytics
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:text-red-700">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden border-t p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search destinations, routes, or places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>
      </div>
    </header>
  )
} 