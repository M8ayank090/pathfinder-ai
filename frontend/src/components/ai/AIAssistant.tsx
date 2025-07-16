'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  MapPin, 
  Route, 
  Heart, 
  Shield, 
  Zap,
  X,
  Minimize2,
  Maximize2,
  Mic,
  MicOff,
  Settings,
  Lightbulb,
  TrendingUp,
  Clock,
  Navigation
} from 'lucide-react'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  type: 'text' | 'route' | 'suggestion' | 'environmental'
  metadata?: {
    route?: {
      name: string
      distance: number
      duration: number
      safetyScore: number
      environmentalScore: number
    }
    location?: {
      name: string
      type: string
      description: string
    }
  }
}

const quickSuggestions = [
  "Where should I go to feel relaxed?",
  "What's the safest route to work?",
  "Show me scenic walking paths",
  "Find quiet places to work",
  "What's the best neighborhood for artists?",
  "Recommend routes with good air quality"
]

const aiResponses = {
  greeting: "Hello! I'm your AI navigation assistant. I can help you find personalized routes based on your mood, safety preferences, and environmental factors. What would you like to explore today?",
  
  relaxation: "Based on your location and current environmental data, I recommend these relaxing spots:\n\n🌳 **Central Park** - 0.8km away\n• Low noise levels (3/10)\n• High greenery score (9/10)\n• Perfect for meditation and reading\n\n🏛️ **City Library Gardens** - 1.2km away\n• Quiet atmosphere\n• Beautiful architecture\n• Great for deep work",
  
  safety: "Here are the safest routes in your area:\n\n🛡️ **Scenic Park Route** - 2.3km\n• Safety Score: 9.2/10\n• Well-lit paths\n• Regular security patrols\n• Avoid after 10 PM\n\n🛡️ **Main Street Route** - 1.8km\n• Safety Score: 8.5/10\n• High traffic areas\n• Good visibility\n• 24/7 surveillance",
  
  environmental: "Current environmental conditions:\n\n🌡️ Temperature: 28°C\n💨 Air Quality: Good (45 AQI)\n🌿 Greenery: High in park areas\n🔇 Noise: Low in residential zones\n\nI recommend routes through green spaces for better air quality and mental well-being.",
  
  default: "I understand you're looking for navigation help. Let me suggest some options based on your preferences. Would you like me to focus on safety, environmental factors, or specific destinations?"
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: aiResponses.greeting,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const simulateTyping = async (response: string) => {
    setIsTyping(true)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    setIsTyping(false)
    return response
  }

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('relax') || lowerMessage.includes('peaceful') || lowerMessage.includes('calm')) {
      return await simulateTyping(aiResponses.relaxation)
    } else if (lowerMessage.includes('safe') || lowerMessage.includes('security') || lowerMessage.includes('danger')) {
      return await simulateTyping(aiResponses.safety)
    } else if (lowerMessage.includes('environment') || lowerMessage.includes('air') || lowerMessage.includes('weather')) {
      return await simulateTyping(aiResponses.environmental)
    } else {
      return await simulateTyping(aiResponses.default)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    const aiResponse = await generateAIResponse(inputValue)
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, aiMessage])
  }

  const handleQuickSuggestion = async (suggestion: string) => {
    setInputValue(suggestion)
    // Auto-send the suggestion
    const userMessage: Message = {
      id: Date.now().toString(),
      content: suggestion,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    const aiResponse = await generateAIResponse(suggestion)
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, aiMessage])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleListening = () => {
    setIsListening(!isListening)
    // Here you would integrate with speech recognition API
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="shadow-2xl border-0 bg-background/95 backdrop-blur">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bot className="h-5 w-5 text-primary" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <CardTitle className="text-sm">AI Navigation Assistant</CardTitle>
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Smart
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="p-0">
              <ScrollArea className="h-80">
                <div className="p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.sender === 'ai' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>

                      {message.sender === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Quick Suggestions */}
            <div className="p-4 border-t">
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Quick suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-1 px-2"
                      onClick={() => handleQuickSuggestion(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about routes, safety, or places..."
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleListening}
                  className={isListening ? 'text-red-500' : ''}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
} 