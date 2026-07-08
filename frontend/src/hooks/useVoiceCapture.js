import { useState, useRef, useCallback } from "react"

const SILENCE_THRESHOLD = 0.02   // energy below this = silence
const SILENCE_DURATION = 1500    // ms of silence before sending
const MIN_SPEECH_DURATION = 800  // ms minimum to count as speech

export function useVoiceCapture({ onResult, onError }) {
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  const streamRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const chunksRef = useRef([])
  const silenceTimerRef = useRef(null)
  const speechStartRef = useRef(null)
  const vadFrameRef = useRef(null)

  const sendAudio = useCallback(async (chunks) => {
    const blob = new Blob(chunks, { type: "audio/webm" })
    const formData = new FormData()
    formData.append("file", blob, "audio.wav")

    try {
      const res = await fetch("http://localhost:8000/audio/analyze", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error("Audio analysis failed")
      const data = await res.json()
      onResult(data)
    } catch (err) {
      onError?.(err)
    }
  }, [onResult, onError])

  const startVAD = useCallback((stream) => {
    audioContextRef.current = new AudioContext()
    analyserRef.current = audioContextRef.current.createAnalyser()
    analyserRef.current.fftSize = 512

    const source = audioContextRef.current.createMediaStreamSource(stream)
    source.connect(analyserRef.current)

    const data = new Uint8Array(analyserRef.current.frequencyBinCount)
    let isSpeaking = false

    const tick = () => {
      analyserRef.current.getByteTimeDomainData(data)

      // RMS energy
      const rms = Math.sqrt(
        data.reduce((sum, v) => sum + Math.pow((v - 128) / 128, 2), 0) / data.length
      )

      if (rms > SILENCE_THRESHOLD) {
        // speech detected
        if (!isSpeaking) {
          isSpeaking = true
          speechStartRef.current = Date.now()
          setSpeaking(true)
          chunksRef.current = []
          mediaRecorderRef.current?.start(100)
        }
        // reset silence timer
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = setTimeout(() => {
          // silence after speech — stop and send
          if (isSpeaking) {
            isSpeaking = false
            setSpeaking(false)
            const duration = Date.now() - speechStartRef.current
            mediaRecorderRef.current?.stop()
            if (duration >= MIN_SPEECH_DURATION) {
              sendAudio([...chunksRef.current])
            }
            chunksRef.current = []
          }
        }, SILENCE_DURATION)
      }

      vadFrameRef.current = requestAnimationFrame(tick)
    }

    vadFrameRef.current = requestAnimationFrame(tick)
  }, [sendAudio])

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      startVAD(stream)
      setListening(true)
    } catch (err) {
      onError?.(err)
    }
  }, [startVAD, onError])

  const stop = useCallback(() => {
    cancelAnimationFrame(vadFrameRef.current)
    clearTimeout(silenceTimerRef.current)
    mediaRecorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioContextRef.current?.close()
    setListening(false)
    setSpeaking(false)
  }, [])

  return { listening, speaking, start, stop }
}
