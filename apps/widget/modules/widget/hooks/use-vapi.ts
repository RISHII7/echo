import { useAtomValue } from "jotai"
import { useEffect, useState } from "react"

import Vapi from "@vapi-ai/web"

import { vapiSecretsAtom, widgetSettingsAtom } from "../atoms/widget-atoms"

interface TranscriptMessage {
  role: "user" | "assistant"
  text: string
}

export const useVapi = () => {
  const vapiSecrets = useAtomValue(vapiSecretsAtom)
  const widgetSettings = useAtomValue(widgetSettingsAtom)

  const [vapi, setVapi] = useState<Vapi | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([])

  useEffect(() => {
    if (!vapiSecrets) {
      return
    }

    const vapiInstance = new Vapi(vapiSecrets.publicApiKey)
    // Store the Vapi client instance created for this external SDK connection.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVapi(vapiInstance)

    vapiInstance.on("call-start", () => {
      setIsConnected(true)
      setIsConnecting(false)
      setTranscript([])
    })

    vapiInstance.on("call-end", () => {
      setIsConnected(false)
      setIsConnecting(false)
      setIsSpeaking(false)
    })

    vapiInstance.on("speech-start", () => {
      setIsSpeaking(true)
    })

    vapiInstance.on("speech-end", () => {
      setIsSpeaking(false)
    })

    vapiInstance.on("error", (error) => {
      console.log(error, "VAPI_ERROR")
      setIsConnecting(false)
    })

    vapiInstance.on("message", (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setTranscript((prev) => [
          ...prev,
          {
            role: message.role === "user" ? "user" : "assistant",
            text: message.transcript,
          },
        ])
      }
    })

    return () => {
      vapiInstance?.stop()
    }
    // Mount-once initialization of the Vapi SDK client. `vapiSecrets` is already
    // resolved before the voice screen mounts, so it is stable here; re-running
    // on its identity would needlessly tear down and rebuild the connection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startCall = () => {
    if (!vapiSecrets || !widgetSettings?.vapiSettings?.assistantId) {
      return
    }
    setIsConnecting(true)

    if (vapi) {
      vapi.start(widgetSettings.vapiSettings.assistantId)
    }
  }

  const endCall = () => {
    if (vapi) {
      vapi.stop()
    }
  }

  return {
    isSpeaking,
    isConnecting,
    isConnected,
    transcript,
    startCall,
    endCall,
  }
}
