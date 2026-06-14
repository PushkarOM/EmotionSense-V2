import { useState } from "react"
import { useTheme } from "./context/ThemeContext"
import { Moon, Sun } from "lucide-react"
import { Button } from "./components/ui/button"

import ChatWindow from "./components/chat/ChatWindow"
import BottomBar from "./components/chat/BottomBar"
import TextInput from "./components/chat/TextInput"
import CameraFeed from "./components/camera/CameraFeed"


import EmotionOrb from "./components/emotion/EmotionOrb"
import SpeakingOrb from "./components/emotion/SpeakingOrb"
import ModalityStatus from "./components/emotion/ModalityStatus"
import EmotionHistory from "./components/emotion/EmotionHistory"
import { useEmotion } from "./context/EmotionContext"

import { sendChatMessage } from "./services/api"

export default function App() {
  const { theme, toggleTheme } = useTheme()

  const [cameraOpen, setCameraOpen] = useState(false)
  const [textOpen, setTextOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [listening] = useState(true)

  const [speaking, setSpeaking] = useState(false)

  const { updateEmotion } = useEmotion()


  const handleSend = async (text) => {
    const userMsg = {
      id: Date.now(),
      role: "user",
      content: text,
      emotion: null,
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const { reply, emotion, confidence } = await sendChatMessage(text)

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: reply,
        emotion,
      }])

      updateEmotion({
        current: emotion,
        confidence,
        sources: { text: emotion, audio: null, face: null },
      })
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: "Could not reach the backend.",
        emotion: null,
      }])
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      
      {/* Header */}
      <header className="border-b px-6 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">EmotionSense</h1>
          <p className="text-xs text-muted-foreground">Multimodal Emotion AI</p>
        </div>
        <div className="flex justify-center items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>
      </header>

      {/* Main two-column layout */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* Left — Chat + Controls */}
        <section className="flex flex-col flex-1 border-r">
          
          {/* Chat transcript */}
          <div className="flex-1 p-4 overflow-hidden">
            <ChatWindow messages={messages} />
          </div>

          {/* Camera feed — shown when open */}
          {cameraOpen && (
            <div className="border-t p-4">
              <CameraFeed />
            </div>
          )}

          {/* Text input — shown when open */}
          {textOpen && (
            <div className="border-t px-4 pt-3">
              <TextInput onSend={handleSend} />
            </div>
          )}

          {/* Bottom bar */}
          <div className="border-t p-4">
            <BottomBar
              listening={listening}
              cameraOpen={cameraOpen}
              onCameraToggle={() => setCameraOpen(c => !c)}
              textOpen={textOpen}
              onTextToggle={() => setTextOpen(t => !t)}
            />
          </div>

        </section>

        
        {/* Right — Emotion Panel */}
        <aside className="w-80 flex flex-col p-4 gap-4 overflow-y-auto">
          <SpeakingOrb speaking={speaking} />
          <EmotionOrb />
          <ModalityStatus />
          <EmotionHistory />
        </aside>

      </main>
    </div>
  )
}