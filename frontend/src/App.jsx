import { useState } from "react"
import { useTheme } from "./context/ThemeContext"
import { Moon, Sun } from "lucide-react"
import { Button } from "./components/ui/button"

import ChatWindow from "./components/chat/ChatWindow"


import EmotionOrb from "./components/emotion/EmotionOrb"
import ModalityStatus from "./components/emotion/ModalityStatus"

export default function App() {
  const { theme, toggleTheme } = useTheme()

  const [cameraOpen, setCameraOpen] = useState(false)
  const [textOpen, setTextOpen] = useState(false)
  const [messages, setMessages] = useState([])


  const handleSend = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: "user",
      content: text,
      emotion: null,
    }])
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Header */}
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">EmotionSense</h1>
          <p className="text-xs text-muted-foreground">Multimodal Emotion AI</p>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </header>

      {/* Main two-column layout */}
      <main className="flex h-[calc(100vh-57px)]">
        
        {/* Left — Chat + Controls */}
        <section className="flex flex-col flex-1 border-r">
          
          {/* Chat transcript */}
          <div className="flex-1 p-4 overflow-hidden">
            <ChatWindow messages={messages} />
          </div>

          {/* Camera feed — shown when open */}
          {cameraOpen && (
            <div className="border-t p-4">
              {/* CameraFeed goes here */}
              <p className="text-muted-foreground text-sm">Camera feed</p>
            </div>
          )}

          {/* Text input — shown when open */}
          {textOpen && (
            <div className="border-t px-4 pt-3">
              {/* TextInput goes here */}
              <p className="text-muted-foreground text-sm">Text input</p>
            </div>
          )}

          {/* Bottom bar */}
          <div className="border-t p-4">
            {/* BottomBar goes here */}
            <p className="text-muted-foreground text-sm">Bottom bar</p>
          </div>

        </section>

        
        {/* Right — Emotion Panel */}
        <aside className="w-80 flex flex-col p-4 gap-4">
          <EmotionOrb />
          <ModalityStatus />
          {/* EmotionHistory goes here */}
          <p className="text-muted-foreground text-sm">Emotion history</p>
        </aside>

      </main>
    </div>
  )
}