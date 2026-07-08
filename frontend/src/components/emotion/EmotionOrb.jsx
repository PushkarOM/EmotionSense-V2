import { useEmotion, EMOTIONS } from "../../context/EmotionContext"

export default function EmotionOrb() {
  const { emotionState } = useEmotion()
  const emotion = EMOTIONS[emotionState.current] ?? EMOTIONS["neutral"]
  const confidence = emotionState.confidence

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      
      {/* Orb */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulse ring */}
        <div
          className="absolute rounded-full opacity-20 animate-ping"
          style={{
            width: 120,
            height: 120,
            backgroundColor: emotion.color,
            animationDuration: `${2 - confidence}s`,  // faster pulse = higher confidence
          }}
        />
        {/* Inner orb */}
        <div
          className="rounded-full flex items-center justify-center transition-colors duration-700"
          style={{
            width: 90,
            height: 90,
            backgroundColor: emotion.color,
            boxShadow: `0 0 40px ${emotion.color}66`,
          }}
        >
          <span className="text-white text-xs font-medium">
            {Math.round(confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="font-semibold text-sm">{emotion.label}</p>
        <p className="text-xs text-muted-foreground">Current emotion</p>
      </div>

    </div>
  )
}