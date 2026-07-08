import { createContext, useContext, useState } from "react"

const EmotionContext = createContext()

// Canonical emotion taxonomy (shared across backend and frontend)
export const EMOTIONS = {
  neutral:     { label: "Neutral",     color: "#6366F1" },
  happy:       { label: "Happy",       color: "#F59E0B" },
  sad:         { label: "Sad",         color: "#3B82F6" },
  angry:       { label: "Angry",       color: "#EF4444" },
  fear:        { label: "Fear",        color: "#8B5CF6" },
  disgust:     { label: "Disgust",     color: "#84CC16" },
  surprise:    { label: "Surprise",    color: "#10B981" },
  frustration: { label: "Frustration", color: "#FB923C" },
}


const defaultEmotionState = {
  current: "neutral",
  confidence: 0,
  sources: {
    text: null,
    audio: null,
    face: null,
  },
  history: [],
}

export function EmotionProvider({ children }) {
  const [emotionState, setEmotionState] = useState(defaultEmotionState)

  const updateEmotion = (newState) => {
    setEmotionState((prev) => ({
      ...newState,
      history: [
        ...prev.history.slice(-19),
        {
          emotion: newState.current,
          confidence: newState.confidence,
          timestamp: Date.now(),
        },
      ],
    }))
  }

  return (
    <EmotionContext.Provider
      value={{
        emotionState,
        updateEmotion,
        EMOTIONS,
      }}
    >
      {children}
    </EmotionContext.Provider>
  )
}

export const useEmotion = () => useContext(EmotionContext)
