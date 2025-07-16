'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  MapPin,
  Globe,
  Palette,
  Smartphone,
  Database,
  Key,
  Download,
  Upload,
  Trash2,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'

export function Settings() {
  const [notifications, setNotifications] = useState({
    routeUpdates: true,
    goalReminders: true,
    weatherAlerts: true,
    achievementUnlocks: true,
    weeklyReports: false
  })

  const [privacy, setPrivacy] = useState({
    locationSharing: true,
    routeHistory: true,
    analyticsSharing: false,
    socialFeatures: true
  })

  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'en',
    units: 'metric',
    defaultTransport: 'walking'
  })

  const [routePreferences, setRoutePreferences] = useState({
    avoidHighways: true,
    preferScenic: true,
    optimizeForTime: false,
    considerWeather: true,
    safetyFirst: true
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <SettingsIcon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences and account</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card className="border-0 shadow-lg bg-background/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john.doe@example.com" />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" placeholder="Tell us about yourself..." />
              </div>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-0 shadow-lg bg-background/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {key === 'routeUpdates' && 'Get notified about route changes and updates'}
                      {key === 'goalReminders' && 'Receive reminders for your goals'}
                      {key === 'weatherAlerts' && 'Weather alerts for your planned routes'}
                      {key === 'achievementUnlocks' && 'Celebrate when you unlock achievements'}
                      {key === 'weeklyReports' && 'Weekly summary of your navigation activity'}
                    </p>
                  </div>
                                     <Switch
                     checked={value}
                     onCheckedChange={(checked: boolean) => 
                       setNotifications(prev => ({ ...prev, [key]: checked }))
                     }
                   />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Route Preferences */}
          <Card className="border-0 shadow-lg bg-background/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Route Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(routePreferences).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {key === 'avoidHighways' && 'Prefer local roads over highways'}
                      {key === 'preferScenic' && 'Prioritize scenic and beautiful routes'}
                      {key === 'optimizeForTime' && 'Focus on fastest route over other factors'}
                      {key === 'considerWeather' && 'Adjust routes based on weather conditions'}
                      {key === 'safetyFirst' && 'Prioritize safety over convenience'}
                    </p>
                  </div>
                                     <Switch
                     checked={value}
                     onCheckedChange={(checked: boolean) => 
                       setRoutePreferences(prev => ({ ...prev, [key]: checked }))
                     }
                   />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="border-0 shadow-lg bg-background/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {key === 'locationSharing' && 'Share your location for better route recommendations'}
                      {key === 'routeHistory' && 'Store your route history for insights'}
                      {key === 'analyticsSharing' && 'Share anonymous usage data to improve the app'}
                      {key === 'socialFeatures' && 'Enable social features and sharing'}
                    </p>
                  </div>
                                     <Switch
                     checked={value}
                     onCheckedChange={(checked: boolean) => 
                       setPrivacy(prev => ({ ...prev, [key]: checked }))
                     }
                   />
                </div>
              ))}
              <Separator />
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  Privacy Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* App Preferences */}
          <Card className="border-0 shadow-lg bg-background/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                App Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Theme</Label>
                <Select value={preferences.theme} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, theme: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Language</Label>
                <Select value={preferences.language} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, language: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Units</Label>
                <Select value={preferences.units} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, units: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric (km, °C)</SelectItem>
                    <SelectItem value="imperial">Imperial (mi, °F)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Default Transport</Label>
                <Select value={preferences.defaultTransport} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, defaultTransport: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walking">Walking</SelectItem>
                    <SelectItem value="cycling">Cycling</SelectItem>
                    <SelectItem value="driving">Driving</SelectItem>
                    <SelectItem value="transit">Public Transit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="border-0 shadow-lg bg-background/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card className="border-0 shadow-lg bg-background/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                App Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Version</span>
                <Badge variant="outline">1.0.0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Build</span>
                <span className="text-sm">2024.1.15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="secondary" className="text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                  Online
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg bg-background/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Globe className="h-4 w-4 mr-2" />
                Help & Support
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Terms of Service
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Account Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 