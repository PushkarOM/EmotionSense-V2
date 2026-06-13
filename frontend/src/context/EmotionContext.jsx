import { createContext, useContext, useState } from "react"

const EmotionContext = createContext()

export const EMOTIONS = {
  admiration:    { label: "Admiration",    color: "#F59E0B" },
  amusement:     { label: "Amusement",     color: "#FBBF24" },
  anger:         { label: "Anger",         color: "#EF4444" },
  annoyance:     { label: "Annoyance",     color: "#F87171" },
  approval:      { label: "Approval",      color: "#34D399" },
  caring:        { label: "Caring",        color: "#FB7185" },
  confusion:     { label: "Confusion",     color: "#A78BFA" },
  curiosity:     { label: "Curiosity",     color: "#22D3EE" },
  desire:        { label: "Desire",        color: "#F472B6" },
  disappointment:{ label: "Disappointment",color: "#60A5FA" },
  disapproval:   { label: "Disapproval",   color: "#FB923C" },
  disgust:       { label: "Disgust",       color: "#84CC16" },
  embarrassment: { label: "Embarrassment", color: "#F9A8D4" },
  excitement:    { label: "Excitement",    color: "#F59E0B" },
  fear:          { label: "Fear",          color: "#8B5CF6" },
  gratitude:     { label: "Gratitude",     color: "#10B981" },
  grief:         { label: "Grief",         color: "#3B82F6" },
  joy:           { label: "Joy",           color: "#FBBF24" },
  love:          { label: "Love",          color: "#EC4899" },
  nervousness:   { label: "Nervousness",   color: "#C084FC" },
  optimism:      { label: "Optimism",      color: "#FACC15" },
  pride:         { label: "Pride",         color: "#F97316" },
  realization:   { label: "Realization",   color: "#06B6D4" },
  relief:        { label: "Relief",        color: "#6EE7B7" },
  remorse:       { label: "Remorse",       color: "#64748B" },
  sadness:       { label: "Sadness",       color: "#3B82F6" },
  surprise:      { label: "Surprise",      color: "#10B981" },
  neutral:       { label: "Neutral",       color: "#6366F1" },
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