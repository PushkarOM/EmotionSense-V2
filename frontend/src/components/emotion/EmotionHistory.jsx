import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"
import { useEmotion, EMOTIONS } from "../../context/EmotionContext"

export default function EmotionHistory() {
  const { emotionState } = useEmotion()
  const { history } = emotionState

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Emotion Timeline
      </p>

      {history.length === 0 ? (
        <p className="text-xs text-muted-foreground">No history yet</p>
      ) : (
        <TooltipProvider delayDuration={100}>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {history.map((entry, i) => {
              const emotion = EMOTIONS[entry.emotion]
              const isLast = i === history.length - 1
              return (
                <Tooltip key={entry.timestamp}>
                  <TooltipTrigger asChild>
                    <div
                      className="rounded-full shrink-0 transition-all cursor-default"
                      style={{
                        width: isLast ? 14 : 10,
                        height: isLast ? 14 : 10,
                        backgroundColor: emotion?.color,
                        opacity: 0.4 + entry.confidence * 0.6,
                        boxShadow: isLast ? `0 0 8px ${emotion?.color}aa` : "none",
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs font-medium">{emotion?.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(entry.confidence * 100)}% ·{" "}
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </TooltipProvider>
      )}
    </div>
  )
}
