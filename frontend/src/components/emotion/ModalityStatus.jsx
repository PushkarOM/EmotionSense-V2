import { useEmotion } from "../../context/EmotionContext"
import { Badge } from "../ui/badge"
import { Type, Mic, Camera } from "lucide-react"

const MODALITIES = [
  { key: "text",  label: "Text",  Icon: Type   },
  { key: "audio", label: "Voice", Icon: Mic    },
  { key: "face",  label: "Face",  Icon: Camera },
]

export default function ModalityStatus() {
  const { emotionState } = useEmotion()

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Active Modalities
      </p>
      <div className="flex gap-2">
        {MODALITIES.map(({ key, label, Icon }) => {
          const active = emotionState.sources[key] !== null
          return (
            <Badge
              key={key}
              variant={active ? "default" : "outline"}
              className="gap-1 text-xs"
            >
              <Icon size={11} />
              {label}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
