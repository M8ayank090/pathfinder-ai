'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  Star,
  Zap,
  Heart,
  Shield,
  Leaf,
  Brain,
  Dumbbell,
  BookOpen,
  Users,
  Lightbulb,
  Award,
  BarChart3,
  ArrowRight,
  Settings,
  Edit,
  Trash2,
  Play,
  Pause
} from 'lucide-react'

interface Goal {
  id: string
  title: string
  description: string
  category: 'fitness' | 'wellness' | 'productivity' | 'social' | 'learning' | 'mindfulness'
  target: string
  progress: number
  isCompleted: boolean
  isActive: boolean
  currentStreak: number
  longestStreak: number
  deadline?: Date
  startDate: Date
  lastUpdated: Date
  aiSuggestions: string[]
  habits: Habit[]
}

interface Habit {
  id: string
  name: string
  frequency: 'daily' | 'weekly' | 'monthly'
  completed: boolean
  streak: number
}

const goalCategories = [
  { id: 'fitness', name: 'Fitness', icon: Dumbbell, color: 'text-red-500', bgColor: 'bg-red-50' },
  { id: 'wellness', name: 'Wellness', icon: Heart, color: 'text-pink-500', bgColor: 'bg-pink-50' },
  { id: 'productivity', name: 'Productivity', icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
  { id: 'social', name: 'Social', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  { id: 'learning', name: 'Learning', icon: BookOpen, color: 'text-purple-500', bgColor: 'bg-purple-50' },
  { id: 'mindfulness', name: 'Mindfulness', icon: Brain, color: 'text-green-500', bgColor: 'bg-green-50' }
]

const sampleGoals: Goal[] = [
  {
    id: '1',
    title: 'Morning Mindfulness',
    description: 'Start each day with 30 minutes of meditation and reflection',
    category: 'mindfulness',
    target: '30 min daily',
    progress: 75,
    isCompleted: false,
    isActive: true,
    currentStreak: 5,
    longestStreak: 12,
    startDate: new Date('2024-01-01'),
    lastUpdated: new Date(),
    aiSuggestions: [
      'Try guided meditation apps like Headspace',
      'Create a dedicated meditation space',
      'Practice deep breathing exercises'
    ],
    habits: [
      { id: '1', name: 'Morning meditation', frequency: 'daily', completed: true, streak: 5 },
      { id: '2', name: 'Journal reflection', frequency: 'daily', completed: false, streak: 3 }
    ]
  },
  {
    id: '2',
    title: 'Daily Steps',
    description: 'Achieve 10,000 steps daily for better health',
    category: 'fitness',
    target: '10,000 steps',
    progress: 60,
    isCompleted: false,
    isActive: true,
    currentStreak: 12,
    longestStreak: 15,
    startDate: new Date('2024-01-01'),
    lastUpdated: new Date(),
    aiSuggestions: [
      'Take walking meetings',
      'Use scenic routes from PathFinder',
      'Set hourly movement reminders'
    ],
    habits: [
      { id: '3', name: 'Morning walk', frequency: 'daily', completed: true, streak: 12 },
      { id: '4', name: 'Evening stroll', frequency: 'daily', completed: false, streak: 8 }
    ]
  },
  {
    id: '3',
    title: 'Creative Inspiration',
    description: 'Dedicate 2 hours weekly to creative projects',
    category: 'productivity',
    target: '2 hours weekly',
    progress: 45,
    isCompleted: false,
    isActive: true,
    currentStreak: 0,
    longestStreak: 4,
    startDate: new Date('2024-01-01'),
    lastUpdated: new Date(),
    aiSuggestions: [
      'Visit inspiring locations in your city',
      'Join creative workshops',
      'Explore new neighborhoods'
    ],
    habits: [
      { id: '5', name: 'Creative session', frequency: 'weekly', completed: false, streak: 0 },
      { id: '6', name: 'Inspiration walk', frequency: 'weekly', completed: true, streak: 2 }
    ]
  }
]

export function GoalEngine() {
  const [goals, setGoals] = useState<Goal[]>(sampleGoals)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'wellness' as Goal['category'],
    target: ''
  })

  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(goal => goal.category === selectedCategory)

  const activeGoals = goals.filter(goal => goal.isActive && !goal.isCompleted)
  const completedGoals = goals.filter(goal => goal.isCompleted)
  const totalProgress = goals.length > 0 
    ? goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length 
    : 0

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.target) return

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      target: newGoal.target,
      progress: 0,
      isCompleted: false,
      isActive: true,
      currentStreak: 0,
      longestStreak: 0,
      startDate: new Date(),
      lastUpdated: new Date(),
      aiSuggestions: generateAISuggestions(newGoal.category),
      habits: generateHabits(newGoal.category)
    }

    setGoals(prev => [...prev, goal])
    setNewGoal({ title: '', description: '', category: 'wellness', target: '' })
    setShowAddGoal(false)
  }

  const generateAISuggestions = (category: Goal['category']): string[] => {
    const suggestions = {
      fitness: [
        'Use PathFinder to find scenic walking routes',
        'Join local fitness groups',
        'Set up home workout space'
      ],
      wellness: [
        'Find peaceful spots for meditation',
        'Explore nature trails',
        'Practice mindful walking'
      ],
      productivity: [
        'Discover quiet cafes for focused work',
        'Find inspiring workspaces',
        'Use productivity apps'
      ],
      social: [
        'Join community events',
        'Visit social hubs in your area',
        'Attend local meetups'
      ],
      learning: [
        'Visit libraries and study spaces',
        'Find educational workshops',
        'Explore cultural districts'
      ],
      mindfulness: [
        'Find meditation spots',
        'Practice nature walks',
        'Create peaceful routines'
      ]
    }
    return suggestions[category] || []
  }

  const generateHabits = (category: Goal['category']): Habit[] => {
    const habits = {
      fitness: [
        { id: '1', name: 'Morning exercise', frequency: 'daily' as const, completed: false, streak: 0 },
        { id: '2', name: 'Evening walk', frequency: 'daily' as const, completed: false, streak: 0 }
      ],
      wellness: [
        { id: '3', name: 'Meditation session', frequency: 'daily' as const, completed: false, streak: 0 },
        { id: '4', name: 'Nature walk', frequency: 'weekly' as const, completed: false, streak: 0 }
      ],
      productivity: [
        { id: '5', name: 'Deep work session', frequency: 'daily' as const, completed: false, streak: 0 },
        { id: '6', name: 'Goal review', frequency: 'weekly' as const, completed: false, streak: 0 }
      ],
      social: [
        { id: '7', name: 'Social interaction', frequency: 'daily' as const, completed: false, streak: 0 },
        { id: '8', name: 'Community event', frequency: 'weekly' as const, completed: false, streak: 0 }
      ],
      learning: [
        { id: '9', name: 'Study session', frequency: 'daily' as const, completed: false, streak: 0 },
        { id: '10', name: 'Skill practice', frequency: 'weekly' as const, completed: false, streak: 0 }
      ],
      mindfulness: [
        { id: '11', name: 'Mindful breathing', frequency: 'daily' as const, completed: false, streak: 0 },
        { id: '12', name: 'Gratitude practice', frequency: 'daily' as const, completed: false, streak: 0 }
      ]
    }
    return habits[category] || []
  }

  const updateGoalProgress = (goalId: string, progress: number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { 
            ...goal, 
            progress: Math.min(100, Math.max(0, progress)),
            isCompleted: progress >= 100,
            lastUpdated: new Date()
          }
        : goal
    ))
  }

  const toggleHabit = (goalId: string, habitId: string) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? {
            ...goal,
            habits: goal.habits.map(habit =>
              habit.id === habitId
                ? { 
                    ...habit, 
                    completed: !habit.completed,
                    streak: !habit.completed ? habit.streak + 1 : Math.max(0, habit.streak - 1)
                  }
                : habit
            )
          }
        : goal
    ))
  }

  return (
    <div className="w-full h-full p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Goal Engine</h1>
            <p className="text-muted-foreground">Track your progress and achieve your goals</p>
          </div>
          <Button onClick={() => setShowAddGoal(!showAddGoal)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{Math.round(totalProgress)}%</div>
                <div className="text-sm text-muted-foreground">Overall Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">{activeGoals.length}</div>
                <div className="text-sm text-muted-foreground">Active Goals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">{completedGoals.length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500">
                  {goals.reduce((sum, goal) => sum + goal.currentStreak, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Goal Form */}
        {showAddGoal && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Goal title"
                value={newGoal.title}
                onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Description"
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value as Goal['category'] }))}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  {goalCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Target (e.g., 30 min daily)"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, target: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddGoal} className="flex-1">
                  Add Goal
                </Button>
                <Button variant="outline" onClick={() => setShowAddGoal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </Button>
          {goalCategories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              <category.icon className="h-4 w-4 mr-2" />
              {category.name}
            </Button>
          ))}
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map(goal => {
            const category = goalCategories.find(c => c.id === goal.category)
            return (
              <Card key={goal.id} className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {category && <category.icon className={`h-5 w-5 ${category.color}`} />}
                      <h3 className="font-semibold">{goal.title}</h3>
                      {goal.isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </div>
                    <Badge variant="outline">
                      {goal.currentStreak} day streak
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{goal.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{goal.target}</span>
                      <span className="text-sm font-medium">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>

                  {/* Habits */}
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">Habits</h4>
                    {goal.habits.slice(0, 2).map(habit => (
                      <div key={habit.id} className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleHabit(goal.id, habit.id)}
                        >
                          {habit.completed ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <Circle className="h-3 w-3" />
                          )}
                        </Button>
                        <span className="text-sm">{habit.name}</span>
                        {habit.streak > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {habit.streak}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* AI Suggestions */}
                  {goal.aiSuggestions.length > 0 && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">AI Suggestions</span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {goal.aiSuggestions.slice(0, 2).map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-yellow-500">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Progress Controls */}
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateGoalProgress(goal.id, goal.progress - 10)}
                      disabled={goal.progress <= 0}
                    >
                      <ArrowRight className="h-3 w-3 rotate-180" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateGoalProgress(goal.id, goal.progress + 10)}
                      disabled={goal.progress >= 100}
                    >
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-auto"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
          <Button variant="outline" className="flex-1">
            <Award className="h-4 w-4 mr-2" />
            Achievements
          </Button>
        </div>
      </div>
    </div>
  )
} 