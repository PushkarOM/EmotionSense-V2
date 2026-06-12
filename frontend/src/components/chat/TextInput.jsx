import { useState } from "react"
import { Button } from "../ui/button"
import { Send } from "lucide-react"

export default function TextInput({ onSend }) {
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
    <div className="flex gap-2 items-end pb-3">
      <textarea
        className="flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-ring min-h-11 max-h-32"
        placeholder="Type a message..."
        rows={1}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
        <Send size={16} />
      </Button>
    </div>
  )
}
