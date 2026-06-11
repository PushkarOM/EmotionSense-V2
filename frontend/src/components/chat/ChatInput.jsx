import { useState } from "react"
import { Button } from "../ui/button"
import { Send, Mic, MicOff, Camera, CameraOff } from "lucide-react"

export default function ChatInput({ onSend, voiceActive, cameraActive, onVoiceToggle, onCameraToggle, disabled }) {
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return
    onSend(input.trim())
    setInput("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      
      {/* Text input row */}
      <div className="flex gap-2 items-end">
        <textarea
          className="flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm 
                     focus:outline-none focus:ring-2 focus:ring-ring min-h-11 max-h-32"
          placeholder="Type a message..."
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <Button size="icon" onClick={handleSend} disabled={!input.trim() || disabled}>
          <Send size={16} />
        </Button>
      </div>

      {/* Modality toggles */}
      <div className="flex gap-2">
        <Button
          variant={voiceActive ? "default" : "outline"}
          size="sm"
          onClick={onVoiceToggle}
          className="gap-1.5 text-xs"
        >
          {voiceActive ? <Mic size={14} /> : <MicOff size={14} />}
          {voiceActive ? "Voice On" : "Voice Off"}
        </Button>
        <Button
          variant={cameraActive ? "default" : "outline"}
          size="sm"
          onClick={onCameraToggle}
          className="gap-1.5 text-xs"
        >
          {cameraActive ? <Camera size={14} /> : <CameraOff size={14} />}
          {cameraActive ? "Camera On" : "Camera Off"}
        </Button>
      </div>

    </div>
  )
}