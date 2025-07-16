'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  Calendar, 
  Clock, 
  MapPin, 
  Heart, 
  Shield, 
  Leaf, 
  Zap, 
  Users, 
  Activity, 
  BarChart3, 
  PieChart, 
  LineChart,
  Star,
  Trophy,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Eye,
  Navigation,
  Compass,
  Thermometer,
  Droplets
} from 'lucide-react'

interface UserStats {
  totalRoutes: number
  totalDistance: number
  totalTime: number
  averageSafetyScore: number
  averageEnvironmentalScore: number
  goalsCompleted: number
  currentStreak: number
  longestStreak: number
  favoriteAreas: string[]
  achievements: Achievement[]
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  date?: Date
}

interface WeeklyProgress {
  date: string
  distance: number
  safetyScore: number
  environmentalScore: number
  goalsProgress: number
}

const sampleUserStats: UserStats = {
  totalRoutes: 47,
  totalDistance: 234.5,
  totalTime: 89,
  averageSafetyScore: 8.7,
  averageEnvironmentalScore: 7.9,
  goalsCompleted: 12,
  currentStreak: 8,
  longestStreak: 15,
  favoriteAreas: ['Central Park', 'Riverside Walk', 'Downtown District'],
  achievements: [
    {
      id: '1',
      name: 'Explorer',
      description: 'Completed 50 routes',
      icon: '🗺️',
      unlocked: true,
      progress: 100,
      date: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Safety First',
      description: 'Maintained 9+ safety score for 30 days',
      icon: '🛡️',
      unlocked: true,
      progress: 100,
      date: new Date('2024-01-20')
    },
    {
      id: '3',
      name: 'Green Walker',
      description: 'Walked 100km through green areas',
      icon: '🌿',
      unlocked: false,
      progress: 75
    },
    {
      id: '4',
      name: 'Goal Crusher',
      description: 'Complete 20 goals',
      icon: '🎯',
      unlocked: false,
      progress: 60
    }
  ]
}

const weeklyData: WeeklyProgress[] = [
  { date: 'Mon', distance: 5.2, safetyScore: 8.5, environmentalScore: 7.8, goalsProgress: 80 },
  { date: 'Tue', distance: 3.8, safetyScore: 9.1, environmentalScore: 8.2, goalsProgress: 90 },
  { date: 'Wed', distance: 6.1, safetyScore: 8.3, environmentalScore: 7.5, goalsProgress: 70 },
  { date: 'Thu', distance: 4.5, safetyScore: 8.9, environmentalScore: 8.0, goalsProgress: 85 },
  { date: 'Fri', distance: 7.2, safetyScore: 8.7, environmentalScore: 8.5, goalsProgress: 95 },
  { date: 'Sat', distance: 8.9, safetyScore: 9.3, environmentalScore: 9.1, goalsProgress: 100 },
  { date: 'Sun', distance: 2.3, safetyScore: 8.1, environmentalScore: 7.2, goalsProgress: 60 }
]

export function Dashboard() {
  const [stats, setStats] = useState<UserStats>(sampleUserStats)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('week')

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'text-green-500'
    if (value >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getProgressIcon = (value: number, previousValue: number) => {
    if (value > previousValue) return <ArrowUp className="h-3 w-3 text-green-500" />
    if (value < previousValue) return <ArrowDown className="h-3 w-3 text-red-500" />
    return <Activity className="h-3 w-3 text-gray-500" />
  }

  const averageWeeklyDistance = weeklyData.reduce((sum, day) => sum + day.distance, 0) / weeklyData.length
  const averageWeeklySafety = weeklyData.reduce((sum, day) => sum + day.safetyScore, 0) / weeklyData.length
  const averageWeeklyEnvironmental = weeklyData.reduce((sum, day) => sum + day.environmentalScore, 0) / weeklyData.length

  return (
    <div className="w-full h-full p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Your personalized navigation insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={selectedTimeframe === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe('week')}
            >
              Week
            </Button>
            <Button
              variant={selectedTimeframe === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe('month')}
            >
              Month
            </Button>
            <Button
              variant={selectedTimeframe === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe('year')}
            >
              Year
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Distance</p>
                  <p className="text-2xl font-bold">{stats.totalDistance} km</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">+12% from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Safety Score</p>
                  <p className="text-2xl font-bold">{stats.averageSafetyScore}/10</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">+0.3 from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Environmental Score</p>
                  <p className="text-2xl font-bold">{stats.averageEnvironmentalScore}/10</p>
                </div>
                <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Leaf className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">+0.5 from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Goals Completed</p>
                  <p className="text-2xl font-bold">{stats.goalsCompleted}</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">+2 this week</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Distance Chart */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Distance (km)</span>
                  <span className="text-sm text-muted-foreground">Avg: {averageWeeklyDistance.toFixed(1)}km/day</span>
                </div>
                <div className="flex items-end gap-1 h-20">
                  {weeklyData.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${(day.distance / 10) * 100}%` }}
                      />
                      <span className="text-xs text-muted-foreground mt-1">{day.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Score Chart */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Safety Score</span>
                  <span className="text-sm text-muted-foreground">Avg: {averageWeeklySafety.toFixed(1)}/10</span>
                </div>
                <div className="flex items-end gap-1 h-20">
                  {weeklyData.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-green-500 rounded-t"
                        style={{ height: `${(day.safetyScore / 10) * 100}%` }}
                      />
                      <span className="text-xs text-muted-foreground mt-1">{day.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environmental Score Chart */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Environmental Score</span>
                  <span className="text-sm text-muted-foreground">Avg: {averageWeeklyEnvironmental.toFixed(1)}/10</span>
                </div>
                <div className="flex items-end gap-1 h-20">
                  {weeklyData.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-emerald-500 rounded-t"
                        style={{ height: `${(day.environmentalScore / 10) * 100}%` }}
                      />
                      <span className="text-xs text-muted-foreground mt-1">{day.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.achievements.map(achievement => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{achievement.name}</h4>
                        {achievement.unlocked && <Star className="h-3 w-3 text-yellow-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      {achievement.unlocked && achievement.date && (
                        <p className="text-xs text-green-500">
                          Unlocked {achievement.date.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{achievement.progress}%</div>
                      <Progress value={achievement.progress} className="h-1 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Performance Trend</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    Your safety score has improved by 15% this month! You're consistently choosing safer routes.
                  </p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Environmental Impact</span>
                  </div>
                  <p className="text-sm text-green-800">
                    You've walked through 23 green areas this week, contributing to better air quality awareness.
                  </p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Goal Recommendation</span>
                  </div>
                  <p className="text-sm text-purple-800">
                    Try exploring the new Riverside Walk - it matches your preference for scenic, safe routes.
                  </p>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">Time Optimization</span>
                  </div>
                  <p className="text-sm text-orange-800">
                    Your morning walks are most productive. Consider scheduling important tasks during this time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Favorite Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Your Favorite Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.favoriteAreas.map((area, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">{area}</h4>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Safety: 9.2/10
                    </div>
                    <div className="flex items-center gap-1">
                      <Leaf className="h-3 w-3" />
                      Environment: 8.7/10
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Visited 12 times
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <Button className="flex-1">
            <Navigation className="h-4 w-4 mr-2" />
            Plan New Route
          </Button>
          <Button variant="outline" className="flex-1">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
          <Button variant="outline" className="flex-1">
            <Target className="h-4 w-4 mr-2" />
            Set New Goal
          </Button>
        </div>
      </div>
    </div>
  )
} 