"use client"

import { useState, useRef, useEffect, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function RecordPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const searchParams = useSearchParams()
    const milestoneId = searchParams.get('milestone_id')
    const router = useRouter()

    const [milestone, setMilestone] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [permission, setPermission] = useState<boolean | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
    const [timer, setTimer] = useState(0)

    const videoRef = useRef<HTMLVideoElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // 1. Fetch Milestone Details
    useEffect(() => {
        const fetchMilestone = async () => {
            try {
                // Determine which milestone we are verifying.
                // We'll fetch the child data and find it in the list (simplest for now without new API)
                const response = await api.get(`/caregiver/child/${id}/`)
                const milestones = response.data.milestones || []
                const found = milestones.find((m: any) => m.id.toString() === milestoneId)
                if (found) {
                    setMilestone(found)
                }
            } catch (err) {
                console.error("Error fetching milestone", err)
            } finally {
                setLoading(false)
            }
        }
        if (milestoneId) fetchMilestone()
    }, [id, milestoneId])

    const [errorMsg, setErrorMsg] = useState<string>("")

    // 2. Camera Setup
    const startCamera = async (useConstraints = true) => {
        setPermission(null)
        setErrorMsg("")
        try {
            const constraints = useConstraints ? { video: { facingMode: "environment" }, audio: true } : { video: true, audio: true }
            const stream = await navigator.mediaDevices.getUserMedia(constraints)

            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
            setPermission(true)
        } catch (err: any) {
            console.error("Camera denied", err)
            // If overconstrained (e.g. no back camera on laptop), try generic
            if (useConstraints && (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError')) {
                console.log("Retrying with generic constraints...")
                return startCamera(false)
            }
            setPermission(false)
            setErrorMsg(err.message || err.name || "Unknown error")
        }
    }

    // Initialize camera on mount
    useEffect(() => {
        startCamera()
        return () => {
            // Cleanup
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    // 3. Recording Logic
    const startRecording = () => {
        if (!streamRef.current) return

        const mediaRecorder = new MediaRecorder(streamRef.current)
        mediaRecorderRef.current = mediaRecorder
        const localChunks: Blob[] = []

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                localChunks.push(event.data)
            }
        }

        mediaRecorder.onstop = () => {
            // iOS Safari often produces 'video/mp4' or 'video/quicktime'. 
            // Do NOT force 'video/webm' in the Blob constructor if we want it to play back natively on iOS.
            // Using generic type allows the browser to handle it better, or we can try to detect.
            const blob = new Blob(localChunks, { type: localChunks[0]?.type || 'video/mp4' })
            console.log("Recording stopped. Blob size:", blob.size, "Type:", blob.type)

            setRecordedChunks(localChunks)
            setVideoBlob(blob)

            // Stop timer
            if (timerRef.current) clearInterval(timerRef.current)
        }

        mediaRecorder.start()
        setIsRecording(true)

        // Start timer
        setTimer(0)
        timerRef.current = setInterval(() => {
            setTimer(prev => prev + 1)
        }, 1000)
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    const retake = () => {
        setVideoBlob(null)
        setRecordedChunks([])
        setTimer(0)
        // Re-attach stream if needed (usually it stays active)
        if (videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current
        }
    }

    const saveRecording = async () => {
        if (!videoBlob || !milestoneId) return

        const formData = new FormData()
        // Create a file from blob. Use the blob's native type or default to mp4 for iOS compatibility.
        // Note: Backend must accept various video formats.
        const ext = videoBlob.type.includes('webm') ? 'webm' : 'mp4'
        const file = new File([videoBlob], `evidence_${milestoneId}_${Date.now()}.${ext}`, { type: videoBlob.type })
        formData.append('file', file)

        setLoading(true) // Re-use loading state or add 'uploading'
        try {
            await api.post(`/clinical/milestones/${milestoneId}/upload_evidence/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            // Success
            router.push(`/caregiver/child/${id}`) // Go back to timeline
        } catch (err) {
            console.error("Upload failed", err)
            alert("Failed to upload evidence. Please try again.")
            setLoading(false)
        }
    }

    // Utilities
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Preparing studio...</div>
    if (permission === false) return (
        <div className="p-8 text-center flex flex-col items-center justify-center min-h-screen bg-black text-white gap-4">
            <div className="text-red-500 text-xl font-bold">Camera access denied</div>
            <p className="text-gray-400 text-sm max-w-xs text-center">
                Please enable camera permissions in your browser settings.
            </p>
            {errorMsg && <code className="text-xs bg-gray-900 p-2 rounded text-red-400">{errorMsg}</code>}
            <Button onClick={() => startCamera(false)} className="bg-white text-black hover:bg-gray-200">
                Retry Camera
            </Button>
            <Button variant="ghost" onClick={() => router.back()} className="text-gray-500">
                Cancel
            </Button>
        </div>
    )

    return (
        <div className="min-h-screen bg-black flex flex-col text-white">
            {/* Top Bar */}
            <div className="p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full">
                <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full h-10 w-10 p-0" onClick={() => router.back()}>
                    ✕
                </Button>
                <div className="text-sm font-semibold opacity-90">
                    {isRecording ? <span className="text-red-500 animate-pulse">● Recording</span> : "Record Evidence"}
                </div>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Instruction Context (only if not recording) */}
            {!isRecording && !videoBlob && milestone && (
                <div className="absolute top-16 left-4 right-4 z-10 animate-in fade-in slide-in-from-top-4">
                    <Card className="bg-white/95 backdrop-blur text-black p-4 rounded-2xl shadow-xl border-0">
                        <div className="flex items-start gap-4">
                            <div className="bg-amber-100 p-2 rounded-full text-2xl">
                                🎥
                            </div>
                            <div>
                                <h2 className="font-bold text-lg text-gray-900 leading-tight mb-1">
                                    Show {milestone.title}
                                </h2>
                                <p className="text-sm text-gray-600 leading-snug">
                                    {milestone.description || "Capture a short video showing this skill."}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Main Camera View */}
            <div className="flex-1 relative overflow-hidden bg-gray-900">
                {videoBlob ? (
                    // Review Mode
                    <div className="h-full w-full flex items-center justify-center bg-black">
                        <video
                            src={URL.createObjectURL(videoBlob)}
                            controls
                            playsInline // Critical for iOS
                            className="max-h-full max-w-full"
                        />
                    </div>
                ) : (
                    // Camera Mode
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-cover"
                    />
                )}

                {/* Timer Overlay */}
                {isRecording && (
                    <div className="absolute bottom-32 left-0 right-0 text-center">
                        <span className="bg-red-600 text-white px-4 py-1 rounded-full font-mono font-bold text-lg shadow-lg">
                            {formatTime(timer)}
                        </span>
                    </div>
                )}
            </div>

            {/* Controls Bar */}
            <div className="bg-black p-6 pb-12 flex flex-col items-center justify-center min-h-[160px] relative">

                {videoBlob ? (
                    // Review Controls
                    <div className="w-full flex gap-4">
                        <Button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white h-14 rounded-xl font-semibold" onClick={retake}>
                            Retake
                        </Button>
                        <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white h-14 rounded-xl font-bold text-lg shadow-amber-500/20 shadow-lg" onClick={saveRecording}>
                            Submit Evidence
                        </Button>
                    </div>
                ) : (
                    // Capture Controls
                    <div className="flex items-center gap-8">
                        {!isRecording ? (
                            <button
                                onClick={startRecording}
                                className="h-20 w-20 rounded-full border-4 border-white flex items-center justify-center group transition-all active:scale-95"
                            >
                                <div className="h-16 w-16 bg-red-500 rounded-full group-hover:bg-red-600 transition-colors"></div>
                            </button>
                        ) : (
                            <button
                                onClick={stopRecording}
                                className="h-20 w-20 rounded-full border-4 border-gray-500 flex items-center justify-center group transition-all active:scale-95"
                            >
                                <div className="h-10 w-10 bg-red-500 rounded-md"></div>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
