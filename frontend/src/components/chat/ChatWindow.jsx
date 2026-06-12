import { useEffect, useRef } from "react"
import { ScrollArea } from "../ui/scroll-area"
import { Badge } from "../ui/badge"
import { EMOTIONS } from "../../context/EmotionContext"

function ChatMessage({ message }) {
  const isUser = message.role === "user"

  return (
    <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm
        ${isUser 
          ? "bg-primary text-primary-foreground rounded-tr-sm" 
          : "bg-muted rounded-tl-sm"
        }`}>
        {message.content}
      </div>
      {message.emotion && (
        <Badge variant="outline" className="text-xs px-2 py-0" style={{
          borderColor: EMOTIONS[message.emotion]?.color,
          color: EMOTIONS[message.emotion]?.color,
        }}>
          {EMOTIONS[message.emotion]?.label}
        </Badge>
      )}
    </div>
  )
}

export default function ChatWindow({ messages }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <ScrollArea className="h-full pr-2">
      <div className="flex flex-col gap-4 py-2">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-sm text-center mt-8">
            Start a conversation — EmotionSense is listening.
          </p>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
