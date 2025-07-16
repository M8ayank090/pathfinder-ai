'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Route, 
  Heart, 
  Shield, 
  TreePine, 
  Volume2, 
  Target,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Clock,
  TrendingUp,
  Calendar,
  Cloud,
  Thermometer,
  Wind,
  Map,
  Settings,
  History,
  Star
} from 'lucide-react'

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const routePreferences = [
    { icon: Heart, label: 'Stress Level', value: 'Low', color: 'text-green-500' },
    { icon: Shield, label: 'Safety', value: 'High', color: 'text-blue-500' },
    { icon: TreePine, label: 'Greenery', value: 'Medium', color: 'text-emerald-500' },
    { icon: Volume2, label: 'Noise', value: 'Low', color: 'text-purple-500' },
  ]

  const navigationItems = [
    { icon: Map, label: 'Map View', active: true },
    { icon: Navigation, label: 'Routes', active: false },
    { icon: History, label: 'History', active: false },
    { icon: Star, label: 'Favorites', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ]

  const userStats = [
    { label: 'Total Distance', value: '127.3 km', icon: TrendingUp },
    { label: 'Routes Taken', value: '24', icon: Route },
    { label: 'Time Saved', value: '8.5 hrs', icon: Clock },
  ]

  if (isCollapsed) {
    return (
      <div className="w-16 border-r bg-background/95 backdrop-blur flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 mb-4"
          onClick={() => setIsCollapsed(false)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <div className="flex flex-col items-center space-y-4">
          {navigationItems.map((item) => (
            <Button
              key={item.label}
              variant={item.active ? "default" : "ghost"}
              size="sm"
              className="w-10 h-10"
              title={item.label}
            >
              <item.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 border-r bg-background/95 backdrop-blur flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Navigation</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(true)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.label}
              variant={item.active ? "default" : "ghost"}
              className="w-full justify-start"
              size="sm"
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* User Stats */}
      <div className="p-4 border-b">
        <h3 className="font-medium mb-3">Your Stats</h3>
        <div className="space-y-3">
          {userStats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <span className="text-sm font-medium">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weather */}
      <div className="p-4 border-b">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Weather
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">22°C</span>
              <div className="text-right">
                <p className="text-sm">Partly Cloudy</p>
                <p className="text-xs text-muted-foreground">Feels like 24°C</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Wind className="h-3 w-3" />
                <span>12 km/h</span>
              </div>
              <div className="flex items-center gap-1">
                <Thermometer className="h-3 w-3" />
                <span>65%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Route Preferences */}
      <div className="p-4 border-b">
        <h3 className="font-medium mb-3">Route Preferences</h3>
        <div className="space-y-3">
          {routePreferences.map((pref) => (
            <Card key={pref.label} className="border-0 bg-muted/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <pref.icon className={`h-4 w-4 ${pref.color}`} />
                    <span className="text-sm">{pref.label}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {pref.value}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
        
      {/* Current Goal */}
      <div className="p-4 flex-1">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Current Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Morning walk for mindfulness
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <Button size="sm" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Route
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 