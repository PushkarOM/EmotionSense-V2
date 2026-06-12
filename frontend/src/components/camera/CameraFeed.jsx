import { useEffect, useRef, useState } from "react"
import { Badge } from "../ui/badge"
import { useEmotion, EMOTIONS } from "../../context/EmotionContext"

export default function CameraFeed() {
  const videoRef = useRef(null)
  const [error, setError] = useState(null)
  const { emotionState } = useEmotion()
  const faceEmotion = emotionState.sources.face

  useEffect(() => {
    let active = true
    let stream

    navigator.mediaDevices?.getUserMedia({ video: true })
      .then(s => {
        if (!active) {
          // component unmounted before promise resolved — kill immediately
          s.getTracks().forEach(t => t.stop())
          return
        }
        stream = s
        if (videoRef.current) videoRef.current.srcObject = s
      })
      .catch(() => setError("Camera access denied"))

    return () => {
      active = false
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop())
        videoRef.current.srcObject = null
      }
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [])

  return (
    <div className="relative w-full max-w-sm mx-auto rounded-xl overflow-hidden border bg-muted aspect-video">
      {error ? (
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
          {error}
        </div>
      ) : (
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
      )}

      {faceEmotion && (
        <Badge
          className="absolute bottom-2 left-2 text-xs"
          style={{ backgroundColor: EMOTIONS[faceEmotion]?.color, color: "#fff" }}
        >
          {EMOTIONS[faceEmotion]?.label}
        </Badge>
      )}
    </div>
  )
}
