"use client"

/* eslint-disable react-hooks/exhaustive-deps */
import { GoogleGenAI, type LiveServerMessage, Modality, type Session } from "@google/genai"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { createBlob, decode, decodeAudioData } from "@/lib/utils2"

const LiveAudio: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [isSessionReady, setIsSessionReady] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant.")
  const [isEditingPrompt, setIsEditingPrompt] = useState(false)
  const [tempPrompt, setTempPrompt] = useState("You are a helpful AI assistant.")
  const [selectedVoice, setSelectedVoice] = useState("Orus")
  
  // Audio visualization state
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(32).fill(0))
  const [frequencyData, setFrequencyData] = useState<number[]>(Array(24).fill(0))
  const animationFrameRef = useRef<number | null>(null)

  const [inputNode, setInputNode] = useState<GainNode | null>(null)
  const [outputNode, setOutputNode] = useState<GainNode | null>(null)

  const clientRef = useRef<GoogleGenAI | null>(null)
  const sessionRef = useRef<Session | null>(null)

  const inputAudioContextRef = useRef<AudioContext | null>(null)
  const outputAudioContextRef = useRef<AudioContext | null>(null)
  const nextStartTimeRef = useRef<number>(0)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const scriptProcessorNodeRef = useRef<ScriptProcessorNode | null>(null)
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set())
  
  // Audio analysis nodes
  const inputAnalyserRef = useRef<AnalyserNode | null>(null)
  const outputAnalyserRef = useRef<AnalyserNode | null>(null)

  // Predefined system prompts for quick selection
  const presetPrompts = [
    {
      name: "Default Assistant",
      prompt: "You are a helpful AI assistant."
    },
    {
      name: "Creative Writer",
      prompt: "You are a creative writing assistant. Help users with storytelling, character development, and creative ideas. Be imaginative and inspiring."
    },
    {
      name: "Technical Expert",
      prompt: "You are a technical expert specializing in programming, engineering, and technology. Provide detailed, accurate technical explanations and solutions."
    },
    {
      name: "Casual Friend",
      prompt: "You are a friendly, casual conversation partner. Be warm, engaging, and speak in a relaxed, conversational tone like a good friend."
    },
    {
      name: "Teacher",
      prompt: "You are an educational tutor. Explain concepts clearly, ask questions to check understanding, and adapt your teaching style to help the user learn effectively."
    },
    {
      name: "Motivational Coach",
      prompt: "You are an enthusiastic motivational coach. Be encouraging, positive, and help users achieve their goals with energy and inspiration."
    }
  ]

  // Available voice options
  const voiceOptions = ["Zephyr", "Puck", "Charon", "Kore", "Fenrir", "Leda","Orus", "Aoede"]

  useEffect(() => {
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 })
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 })
    inputAudioContextRef.current = inputAudioContext
    outputAudioContextRef.current = outputAudioContext

    const inputGainNode = inputAudioContext.createGain()
    const outputGainNode = outputAudioContext.createGain()
    outputGainNode.connect(outputAudioContext.destination)
    setInputNode(inputGainNode)
    setOutputNode(outputGainNode)

    // Create analyser nodes for audio visualization
    const inputAnalyser = inputAudioContext.createAnalyser()
    const outputAnalyser = outputAudioContext.createAnalyser()
    
    // Configure analyser settings
    inputAnalyser.fftSize = 256
    outputAnalyser.fftSize = 256
    inputAnalyser.smoothingTimeConstant = 0.8
    outputAnalyser.smoothingTimeConstant = 0.8
    
    // Create data arrays for frequency data
    const inputDataArray = new Uint8Array(inputAnalyser.frequencyBinCount)
    const outputDataArray = new Uint8Array(outputAnalyser.frequencyBinCount)
    
    // Store references
    inputAnalyserRef.current = inputAnalyser
    outputAnalyserRef.current = outputAnalyser
    
    // Connect input analyser to input gain node
    inputGainNode.connect(inputAnalyser)
    
    // Connect output analyser between output gain and destination
    outputGainNode.disconnect()
    outputGainNode.connect(outputAnalyser)
    outputAnalyser.connect(outputAudioContext.destination)

    nextStartTimeRef.current = outputAudioContext.currentTime

    const client = new GoogleGenAI({
      apiKey: "AIzaSyCF6yaY7zD5XnovoMkkkHRViiji2IRGnZg",
    })
    clientRef.current = client

    setStatus("Initializing session...")
    initSession()

    return () => {
      sessionRef.current?.close()
      stopRecording(true) // cleanup on unmount
      inputAudioContext.close()
      outputAudioContext.close()
    }
  }, [])

  const initSession = async () => {
    if (!clientRef.current || !outputAudioContextRef.current || !outputNode) return

    const model = "gemini-live-2.5-flash-preview"
    const outputAudioContext = outputAudioContextRef.current

    try {
      const session = await clientRef.current.live.connect({
        model: model,
        callbacks: {
          onopen: () => {
            setStatus("Ready to start recording.")
            setIsSessionReady(true)
          },
          onmessage: async (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData

            if (audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime)

              const audioBuffer = await decodeAudioData(decode(audio.data), outputAudioContext, 24000, 1)
              const source = outputAudioContext.createBufferSource()
              source.buffer = audioBuffer
              source.connect(outputNode)
              source.addEventListener("ended", () => {
                sourcesRef.current.delete(source)
              })

              source.start(nextStartTimeRef.current)
              nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration
              sourcesRef.current.add(source)
            }

            const interrupted = message.serverContent?.interrupted
            if (interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop()
                sourcesRef.current.delete(source)
              }
              nextStartTimeRef.current = 0
            }
          },
          onerror: (e: ErrorEvent) => {
            setError(e.message)
          },
          onclose: (e: CloseEvent) => {
            setStatus("Session closed: " + e.reason)
            setIsSessionReady(false)
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
          },
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
        },
      })
      sessionRef.current = session
    } catch (e: any) {
      console.error(e)
      setError(`Failed to initialize session: ${e.message}`)
      setIsSessionReady(false)
    }
  }

  const isRecordingRef = useRef(isRecording)
  useEffect(() => {
    isRecordingRef.current = isRecording
  }, [isRecording])

  const startRecording = async () => {
    if (isRecordingRef.current || !inputAudioContextRef.current || !inputNode) {
      return
    }

    const inputAudioContext = inputAudioContextRef.current
    inputAudioContext.resume()

    setStatus("Requesting microphone access...")

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      })
      mediaStreamRef.current = mediaStream

      setStatus("Microphone access granted. Starting capture...")

      const sourceNode = inputAudioContext.createMediaStreamSource(mediaStream)
      sourceNodeRef.current = sourceNode
      sourceNode.connect(inputNode)

      // Connect to input analyser for visualization
      if (inputAnalyserRef.current) {
        sourceNode.connect(inputAnalyserRef.current)
      }

      const bufferSize = 256
      const scriptProcessorNode = inputAudioContext.createScriptProcessor(bufferSize, 1, 1)
      scriptProcessorNodeRef.current = scriptProcessorNode

      scriptProcessorNode.onaudioprocess = (audioProcessingEvent) => {
        if (!isRecordingRef.current) return

        const inputBuffer = audioProcessingEvent.inputBuffer
        const pcmData = inputBuffer.getChannelData(0)

        sessionRef.current?.sendRealtimeInput({ media: createBlob(pcmData) })
      }

      sourceNode.connect(scriptProcessorNode)
      scriptProcessorNode.connect(inputAudioContext.destination)

      setIsRecording(true)
      setStatus("🔴 Recording... Capturing PCM chunks.")
    } catch (err: any) {
      console.error("Error starting recording:", err)
      setStatus(`Error: ${err.message}`)
      stopRecording()
    }
  }

  const stopRecording = (cleanup = false) => {
    if (!cleanup && !isRecordingRef.current) return

    if (!cleanup) setStatus("Stopping recording...")

    setIsRecording(false)

    if (scriptProcessorNodeRef.current && sourceNodeRef.current) {
      scriptProcessorNodeRef.current.onaudioprocess = null
      scriptProcessorNodeRef.current.disconnect()
      sourceNodeRef.current.disconnect()
      scriptProcessorNodeRef.current = null
      sourceNodeRef.current = null
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    if (!cleanup) setStatus("Recording stopped. Click Start to begin again.")
  }

  const updateSystemPrompt = (newPrompt: string) => {
    setSystemPrompt(newPrompt)
    setTempPrompt(newPrompt)
    // Reset session with new prompt
    if (sessionRef.current) {
      sessionRef.current.close()
      setIsSessionReady(false)
      setStatus("Updating AI personality...")
      setTimeout(() => initSession(), 500)
    }
  }

  const handlePresetSelect = (preset: typeof presetPrompts[0]) => {
    updateSystemPrompt(preset.prompt)
    setIsEditingPrompt(false)
  }

  const handleCustomPromptSave = () => {
    if (tempPrompt.trim()) {
      updateSystemPrompt(tempPrompt.trim())
      setIsEditingPrompt(false)
    }
  }

  const handleCustomPromptCancel = () => {
    setTempPrompt(systemPrompt)
    setIsEditingPrompt(false)
  }

  const handleVoiceChange = (voice: string) => {
    setSelectedVoice(voice)
    // Reset session with new voice
    if (sessionRef.current) {
      sessionRef.current.close()
      setIsSessionReady(false)
      setStatus("Updating voice...")
      setTimeout(() => initSession(), 500)
    }
  }

  const reset = () => {
    if (isRecording) {
      stopRecording()
    }
    sessionRef.current?.close()
    setIsSessionReady(false)
    setStatus("Initializing new session...")
    initSession()
  }

  // Audio visualization animation
  useEffect(() => {
    const animate = () => {
      if (isRecording || isSessionReady) {
        let newAudioLevels = Array(32).fill(0)
        let newFrequencyData = Array(24).fill(0)

        // Get real audio data if available
        if (inputAnalyserRef.current && isRecording) {
          // Create fresh data array and get input (microphone) frequency data
          const inputData = new Uint8Array(inputAnalyserRef.current.frequencyBinCount)
          inputAnalyserRef.current.getByteFrequencyData(inputData)
          
          // Map frequency data to our 32 bars
          const binSize = Math.floor(inputData.length / 32)
          for (let i = 0; i < 32; i++) {
            let sum = 0
            for (let j = 0; j < binSize; j++) {
              const index = i * binSize + j
              if (index < inputData.length) {
                sum += inputData[index]
              }
            }
            const average = sum / binSize
            newAudioLevels[i] = (average / 255) * 100 // Convert to percentage
          }
        }

        if (outputAnalyserRef.current) {
          // Create fresh data array and get output (AI voice) frequency data
          const outputData = new Uint8Array(outputAnalyserRef.current.frequencyBinCount)
          outputAnalyserRef.current.getByteFrequencyData(outputData)
          
          // Map frequency data to radial bars
          const binSize = Math.floor(outputData.length / 24)
          for (let i = 0; i < 24; i++) {
            let sum = 0
            for (let j = 0; j < binSize; j++) {
              const index = i * binSize + j
              if (index < outputData.length) {
                sum += outputData[index]
              }
            }
            const average = sum / binSize
            newFrequencyData[i] = (average / 255) * 50 // Convert to pixel height
          }
        }

        // Fall back to subtle animation if no real audio data
        if (!isRecording && isSessionReady) {
          newAudioLevels = Array(32).fill(0).map((_, i) => {
            const baseLevel = 5 + Math.random() * 10
            const frequencyFactor = Math.sin((i / 32) * Math.PI) * 0.5 + 0.5
            return baseLevel * frequencyFactor
          })
          
          newFrequencyData = Array(24).fill(0).map(() => 5 + Math.random() * 8)
        }
        
        setAudioLevels(newAudioLevels)
        setFrequencyData(newFrequencyData)
      } else {
        // Idle state - minimal activity
        setAudioLevels(Array(32).fill(0).map(() => 3 + Math.random() * 5))
        setFrequencyData(Array(24).fill(0).map(() => 3 + Math.random() * 5))
      }
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    animationFrameRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isRecording, isSessionReady])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-balance text-foreground tracking-tight">AI Voice Agent</h1>
        <p className="text-muted-foreground text-base md:text-lg mt-2">Experience real-time, natural voice interaction</p>
      </div>

      {/* Main Container */}
      <div className="bg-card/20 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-border shadow-sm max-w-5xl w-full">
        {/* System Prompt Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">AI Personality</h2>
            <button
              onClick={() => {
                setTempPrompt(systemPrompt)
                setIsEditingPrompt(!isEditingPrompt)
              }}
              className="px-3 py-1.5 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-lg border border-primary/20 transition-colors"
            >
              {isEditingPrompt ? "Cancel" : "Customize"}
            </button>
          </div>

          {!isEditingPrompt ? (
            <div className="space-y-3">
              {/* Current Prompt Display */}
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground leading-relaxed">{systemPrompt}</p>
              </div>

              {/* Preset Prompts */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {presetPrompts.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetSelect(preset)}
                    disabled={isRecording}
                    className={`p-2.5 text-xs font-medium rounded-lg border transition-all text-left ${
                      systemPrompt === preset.prompt
                        ? "bg-primary/20 text-primary border-primary/30"
                        : "bg-card/20 hover:bg-card/30 text-muted-foreground border-border hover:border-primary/20"
                    } ${isRecording ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Custom Prompt Editor */}
              <textarea
                value={tempPrompt}
                onChange={(e) => setTempPrompt(e.target.value)}
                placeholder="Enter your custom system prompt..."
                className="w-full h-24 p-3 text-sm bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
              />
              
              {/* Editor Actions */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCustomPromptCancel}
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomPromptSave}
                  disabled={!tempPrompt.trim() || isRecording}
                  className="px-4 py-1.5 text-sm bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Voice Selection Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Voice Selection</h2>
            <div className="px-3 py-1.5 text-sm bg-muted/30 text-muted-foreground rounded-lg border border-border">
              Current: {selectedVoice}
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {voiceOptions.map((voice) => (
              <button
                key={voice}
                onClick={() => handleVoiceChange(voice)}
                disabled={isRecording}
                className={`p-2.5 text-xs font-medium rounded-lg border transition-all ${
                  selectedVoice === voice
                    ? "bg-primary/20 text-primary border-primary/30"
                    : "bg-card/20 hover:bg-card/30 text-muted-foreground border-border hover:border-primary/20"
                } ${isRecording ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {voice}
              </button>
            ))}
          </div>
        </div>

        {/* Status Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className={`relative w-3.5 h-3.5 rounded-full ${isSessionReady ? "bg-primary" : "bg-red-500"}`}
              aria-label={isSessionReady ? "AI Ready" : "Connecting"}
            >
              {isSessionReady && <span className="absolute inset-0 rounded-full bg-primary/60 animate-ping" />}
            </div>
            <span className="font-semibold text-foreground">{isSessionReady ? "AI Ready" : "Connecting..."}</span>
          </div>

          <div
            className={`px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold tracking-wide border ${
              isRecording ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-muted/30 text-muted-foreground border-border"
            }`}
            aria-live="polite"
          >
            {isRecording ? "● LIVE" : "○ STANDBY"}
          </div>
        </div>

        {/* Enhanced Audio Visualizer with Mic and Particles */}
        {inputNode && outputNode && (
          <div className="mb-8 flex items-center justify-center">
            <div className="relative size-80 md:size-96 rounded-full bg-gradient-to-br from-primary/5 via-transparent to-primary/10 flex items-center justify-center overflow-hidden">
              
              {/* Particle Ring Animation */}
              <div className="absolute inset-0">
                {Array.from({ length: 60 }, (_, i) => {
                  const angle = (i * 6) * (Math.PI / 180); // 60 particles, 6 degrees apart
                  const radius = 140 + (audioLevels[i % 32] || 0) * 0.5; // Responsive radius
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const size = 2 + (frequencyData[i % 24] || 0) * 0.1;
                  const opacity = isRecording ? 0.6 + (audioLevels[i % 32] || 0) * 0.01 : 0.3;
                  
                  return (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-primary rounded-full transition-all duration-200 ease-out"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        width: `${size}px`,
                        height: `${size}px`,
                        opacity: opacity,
                        transform: isRecording 
                          ? `scale(${1 + (audioLevels[i % 32] || 0) * 0.02}) rotate(${Date.now() * 0.05 + i * 6}deg)`
                          : `scale(1) rotate(${Date.now() * 0.02 + i * 6}deg)`,
                        transformOrigin: 'center'
                      }}
                    />
                  );
                })}
              </div>

              {/* Secondary Particle Ring */}
              <div className="absolute inset-0">
                {Array.from({ length: 40 }, (_, i) => {
                  const angle = (i * 9 + 90) * (Math.PI / 180); // Offset by 90 degrees
                  const radius = 100 + (audioLevels[i % 32] || 0) * 0.3;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const size = 1.5 + (frequencyData[i % 24] || 0) * 0.08;
                  const opacity = isRecording ? 0.4 + (audioLevels[i % 32] || 0) * 0.008 : 0.2;
                  
                  return (
                    <div
                      key={i}
                      className="absolute bg-primary/70 rounded-full transition-all duration-250 ease-out"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        width: `${size}px`,
                        height: `${size}px`,
                        opacity: opacity,
                        transform: isRecording 
                          ? `scale(${1 + (audioLevels[i % 32] || 0) * 0.015}) rotate(${-Date.now() * 0.03 + i * 9}deg)`
                          : `scale(1) rotate(${-Date.now() * 0.015 + i * 9}deg)`
                      }}
                    />
                  );
                })}
              </div>

              {/* Inner Pulse Ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="absolute rounded-full border-2 border-primary/30 transition-all duration-300"
                  style={{
                    width: `${200 + (audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length) * 2}px`,
                    height: `${200 + (audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length) * 2}px`,
                    opacity: isRecording ? 0.6 : 0.3
                  }}
                />
                <div
                  className="absolute rounded-full border border-primary/20 transition-all duration-400"
                  style={{
                    width: `${160 + (audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length) * 1.5}px`,
                    height: `${160 + (audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length) * 1.5}px`,
                    opacity: isRecording ? 0.4 : 0.2
                  }}
                />
              </div>

              {/* Central Microphone Container */}
              <div className="relative z-10 flex items-center justify-center">
                <div 
                  className="relative rounded-full bg-background/30 backdrop-blur-sm border border-primary/40 flex items-center justify-center transition-all duration-300"
                  style={{
                    width: `${120 + (audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length) * 0.5}px`,
                    height: `${120 + (audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length) * 0.5}px`,
                    boxShadow: isRecording 
                      ? `0 0 ${20 + (audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length) * 0.3}px rgba(120, 252, 214, 0.3)`
                      : '0 0 10px rgba(120, 252, 214, 0.1)'
                  }}
                >
                  {/* Microphone Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 -960 960 960"
                    className={`transition-all duration-300 ${
                      isRecording 
                        ? "fill-primary" 
                        : "fill-primary/80"
                    }`}
                    width="64"
                    height="64"
                    style={{
                      transform: isRecording 
                        ? `scale(${1.1 + (audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length) * 0.005})`
                        : 'scale(1)',
                      filter: isRecording 
                        ? `drop-shadow(0 0 ${8 + (audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length) * 0.1}px rgba(120, 252, 214, 0.6))`
                        : 'none'
                    }}
                    aria-hidden="true"
                  >
                    <path d="M480-480q-33 0-56.5-23.5T400-560v-200q0-33 23.5-56.5T480-840q33 0 56.5 23.5T560-760v200q0 33-23.5 56.5T480-480Zm-40 240v-81q-95-14-157.5-86.5T220-600h80q0 75 52.5 127.5T480-420q75 0 127.5-52.5T660-600h80q0 97-62.5 169.5T520-321v81h140v80H300v-80h140Z" />
                  </svg>

                  {/* Mic Activity Indicator */}
                  {isRecording && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse">
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
                    </div>
                  )}
                </div>

                {/* Audio Level Bars around Mic */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {Array.from({ length: 8 }, (_, i) => {
                    const angle = (i * 45) * (Math.PI / 180);
                    const distance = 80;
                    const x = Math.cos(angle) * distance;
                    const y = Math.sin(angle) * distance;
                    const level = audioLevels[i * 4] || 0;
                    
                    return (
                      <div
                        key={i}
                        className="absolute bg-primary/60 rounded-full transition-all duration-150"
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          width: '3px',
                          height: `${Math.max(8, level * 0.4)}px`,
                          opacity: isRecording ? 0.8 : 0.3,
                          transform: `rotate(${(i * 45)}deg)`,
                          transformOrigin: 'center bottom'
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Floating Text Particles for Volume Level */}
              {isRecording && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-primary/20 rounded-full border border-primary/30 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-primary">
                      {Math.round(audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Outer Glow Effect */}
              <div 
                className="absolute inset-0 rounded-full transition-all duration-500"
                style={{
                  background: isRecording 
                    ? `radial-gradient(circle, transparent 60%, rgba(120, 252, 214, ${0.1 + (audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length) * 0.002}) 100%)`
                    : 'radial-gradient(circle, transparent 60%, rgba(120, 252, 214, 0.05) 100%)'
                }}
              />
            </div>
          </div>
        )}

        {/* Control Panel */}
        <div className="space-y-8">
          {/* Main Control Buttons */}
          <div className="flex items-center justify-center gap-6">
            {/* Reset Button */}
            <div className="relative group">
              <button
                onClick={reset}
                disabled={isRecording}
                className="relative bg-card/20 hover:bg-card/30 disabled:bg-card/10 border border-border disabled:border-border/50 rounded-2xl p-4 transition-colors shadow-sm hover:shadow disabled:cursor-not-allowed"
                aria-label="Reset Session"
                title="Reset Session"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="26"
                  viewBox="0 -960 960 960"
                  width="26"
                  className={`${isRecording ? "fill-muted-foreground/50" : "fill-muted-foreground"}`}
                >
                  <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
                </svg>
              </button>
            </div>

            {/* Start (Primary) */}
            <div className="relative group">
              <button
                onClick={startRecording}
                disabled={isRecording || !isSessionReady}
                className="relative rounded-full p-7 border-2 transition-all shadow-sm
                                         bg-primary text-primary-foreground border-primary
                                         hover:bg-primary/90 hover:border-primary/90 hover:shadow
                                         disabled:bg-muted disabled:text-muted-foreground disabled:border-muted disabled:cursor-not-allowed"
                aria-label="Start Recording"
                title="Start Recording"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="fill-current"
                  viewBox="0 0 24 24"
                  width="28"
                  height="28"
                  aria-hidden="true"
                >
                  <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
                </svg>
              </button>
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm font-medium text-muted-foreground">
                {isRecording ? "Recording..." : "Start"}
              </div>
            </div>

            {/* Stop Button */}
            <div className="relative group">
              <button
                onClick={() => stopRecording()}
                disabled={!isRecording}
                className="relative bg-card/20 hover:bg-red-500/20 disabled:bg-card/10 border border-border hover:border-red-500/30 disabled:border-border/50 rounded-2xl p-4 transition-colors shadow-sm hover:shadow disabled:cursor-not-allowed"
                aria-label="Stop Recording"
                title="Stop Recording"
              >
                <div className={`w-6 h-6 rounded-sm ${!isRecording ? "bg-muted-foreground/50" : "bg-red-500"}`} />
              </button>
            </div>
          </div>

          {/* Status Display */}
          <div className="text-center">
            <div className="inline-block px-4 py-2.5 bg-primary/10 rounded-full border border-primary/20">
              <span className={`text-sm md:text-base font-medium ${error ? "text-red-400" : "text-muted-foreground"}`}>
                {error || status || "Ready to begin your conversation"}
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center space-y-1">
            <p className="text-muted-foreground">Click Start to begin voice interaction</p>
            <p className="text-muted-foreground/70 text-sm">Speak naturally — AI will respond in real time</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-muted-foreground/70 text-xs">
        <p className="font-medium">Powered by Gemini Live</p>
      </div>
    </div>
  )
}

export default LiveAudio
