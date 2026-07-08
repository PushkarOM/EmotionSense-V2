import { useEffect, useRef, useState } from "react"
import { useEmotion, EMOTIONS } from "../../context/EmotionContext"

// Phase 3: replace with real TTS audio analyser amplitude
function useSimulatedAmplitude(active) {
  const [amplitude, setAmplitude] = useState(0)

  useEffect(() => {
    if (!active) {
      setAmplitude(0)
      return
    }
    let frame
    const tick = () => {
      setAmplitude(0.3 + Math.random() * 0.7)
      frame = requestAnimationFrame(() => setTimeout(tick, 80))
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [active])

  return amplitude
}

export default function SpeakingOrb({ speaking = false }) {
  const { emotionState } = useEmotion()
  const emotion = EMOTIONS[emotionState.current] ?? EMOTIONS["neutral"]
  const amplitude = useSimulatedAmplitude(speaking)

  const baseScale = 1
  const scale = speaking ? baseScale + amplitude * 0.25 : baseScale + Math.sin(Date.now() / 1000) * 0.02

  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative w-40 h-40 flex items-center justify-center">

        {/* Outer reactive rings — only visible when speaking */}
        {speaking && [0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute rounded-full border-2 transition-all duration-150"
            style={{
              borderColor: emotion.color,
              width: `${100 + amplitude * 60 + i * 25}%`,
              height: `${100 + amplitude * 60 + i * 25}%`,
              opacity: 0.25 - i * 0.07,
            }}
          />
        ))}

        {/* Breathing halo — idle state */}
        <div
          className="absolute rounded-full transition-all duration-1000"
          style={{
            width: speaking ? "115%" : "108%",
            height: speaking ? "115%" : "108%",
            backgroundColor: emotion.color,
            opacity: 0.15,
          }}
        />

        {/* Core orb */}
        <div
          className="rounded-full transition-transform duration-100 ease-out"
          style={{
            width: "60%",
            height: "60%",
            backgroundColor: emotion.color,
            transform: `scale(${scale})`,
            boxShadow: `0 0 ${speaking ? 50 + amplitude * 40 : 30}px ${emotion.color}88`,
          }}
        />
      </div>
    </div>
  )
}
