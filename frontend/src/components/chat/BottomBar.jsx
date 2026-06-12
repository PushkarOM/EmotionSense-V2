import { Mic, Camera, Keyboard } from "lucide-react"
import { Button } from "../ui/button"

export default function BottomBar({ listening, cameraOpen, onCameraToggle, textOpen, onTextToggle }) {
  return (
    <div className="flex items-center justify-between">
      
      {/* Mic status — always listening */}
      <div className="flex items-center gap-2 text-sm">
        <span className={`relative flex h-2.5 w-2.5 rounded-full ${listening ? "bg-green-500" : "bg-muted-foreground"}`}>
          {listening && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping" />
          )}
        </span>
        <Mic size={14} />
        <span className="text-muted-foreground text-xs">
          {listening ? "Listening..." : "Mic off"}
        </span>
      </div>

      {/* Right controls */}
      <div className="flex gap-2">
        <Button
          variant={cameraOpen ? "default" : "outline"}
          size="icon"
          onClick={onCameraToggle}
        >
          <Camera size={16} />
        </Button>
        <Button
          variant={textOpen ? "default" : "outline"}
          size="icon"
          onClick={onTextToggle}
        >
          <Keyboard size={16} />
        </Button>
      </div>

    </div>
  )
}
