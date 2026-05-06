'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, Loader2, Bot, User } from 'lucide-react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your onboarding assistant. Ask me anything about the company — I\'ll answer based on the company documents.'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const question = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setLoading(true)

    try {
      const res = await fetch('/api/employee/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      }])
    }

    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Ask AI Assistant</h1>
          <p className="text-muted-foreground">
            Ask anything about the company — powered by your company documents
          </p>
        </div>

        {/* Chat */}
        <Card className="flex flex-col h-[600px]">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-muted rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4 flex gap-3">
            <Input
              placeholder="Ask about leave policy, work hours, expenses..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

        </Card>

      </div>
    </div>
  )
}