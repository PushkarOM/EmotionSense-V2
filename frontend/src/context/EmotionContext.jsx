import { createContext, useContext, useState } from "react"

const EmotionContext = createContext()

export const EMOTIONS = {
  neutral:  { label: "Neutral",  color: "#6366F1" },
  happy:    { label: "Happy",    color: "#F59E0B" },
  sad:      { label: "Sad",      color: "#3B82F6" },
  angry:    { label: "Angry",    color: "#EF4444" },
  fearful:  { label: "Fearful",  color: "#8B5CF6" },
  surprised:{ label: "Surprised",color: "#10B981" },
  disgusted:{ label: "Disgusted",color: "#F97316" },
}

const defaultEmotionState = {
  current: "neutral",
  confidence: 0,
  sources: { text: null, audio: null, face: null },  // each module's output
  history: [],   // array of { emotion, confidence, timestamp }
}

export function EmotionProvider({ children }) {
  const [emotionState, setEmotionState] = useState(defaultEmotionState)

  const updateEmotion = (newState) => {
    setEmotionState(prev => ({
      ...newState,
      history: [
        ...prev.history.slice(-19),  // keep last 20
        { emotion: newState.current, confidence: newState.confidence, timestamp: Date.now() }
      ]
    }))
  }

  return (
    <EmotionContext.Provider value={{ emotionState, updateEmotion, EMOTIONS }}>
      {children}
    </EmotionContext.Provider>
  )
}

export const useEmotion = () => useContext(EmotionContext)