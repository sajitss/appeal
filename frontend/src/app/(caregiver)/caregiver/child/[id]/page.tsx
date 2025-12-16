"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TimelineEvent {
    id: number
    type: string
    title: string
    date: string
    icon: string
    description: string
    evidence_url?: string
    status?: string
}

export default function ChildTimeline({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [child, setChild] = useState<any>(null)
    const [timeline, setTimeline] = useState<TimelineEvent[]>([])
    const [milestones, setMilestones] = useState<any[]>([])
    const [pendingActions, setPendingActions] = useState<any[]>([])
    const [expandedActivity, setExpandedActivity] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchTimeline = async () => {
        try {
            const response = await api.get(`/caregiver/child/${id}/`)
            setChild(response.data.child)
            setTimeline(response.data.timeline)
            setMilestones(response.data.milestones)
            setPendingActions(response.data.pending_actions || [])
        } catch (error) {
            console.error("Failed to load timeline", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTimeline()
    }, [id])

    const handleForceCompletion = async (milestoneId: number) => {
        try {
            await api.post(`/clinical/milestones/${milestoneId}/perform_human_review/`)
            fetchTimeline() // Refresh UI
            alert("Milestone forcibly pushed to completion.")
        } catch (error) {
            console.error(error)
            alert("Failed to force completion.")
        }
    }

    if (loading) return <div className="p-8 text-center text-[#4A8268]">Loading...</div>
    if (!child) return <div className="p-8 text-center text-[#4A8268]">Child not found</div>

    return (
        <div className="relative min-h-screen bg-[#FFFBF5] overflow-hidden flex flex-col font-sans selection:bg-[#4A8268] selection:text-white">

            {/* Background Decorative Blobs */}
            <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-[#4A8268]/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-30%] w-[500px] h-[500px] bg-yellow-200/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-[#4A8268]/10 p-4 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-[#4A8268] hover:bg-[#4A8268]/10 hover:text-[#2C5F4B]">
                    ←
                </Button>
                <div>
                    <h1 className="text-xl font-bold text-[#2C5F4B]">{child.name}</h1>
                    <p className="text-xs text-[#5D8B75]">{child.age}</p>
                </div>
            </div>

            <div className="flex-1 p-4 space-y-6 z-10 relative">

                {/* Pending Actions Stack */}
                {pendingActions.length > 0 && (
                    <div className="space-y-3">
                        {pendingActions.map((action: any, idx: number) => (
                            <div key={idx}
                                className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2 cursor-pointer hover:shadow-md hover:border-amber-200 transition-all active:scale-[0.99] group"
                                style={{ animationDelay: `${idx * 100}ms` }}
                                onClick={() => {
                                    if (action.type !== 'generic') {
                                        router.push(`/caregiver/child/${id}/record?milestone_id=${action.milestone_id}`)
                                    }
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm text-xl group-hover:scale-110 transition-transform ring-2 ring-amber-100">
                                        {action.type === 'video' ? '🎥' : action.type === 'generic' ? '🎉' : '📝'}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-amber-900 text-sm group-hover:text-amber-800">{action.title}</h3>
                                        <p className="text-xs text-amber-700/80 leading-tight mt-0.5">{action.description}</p>
                                    </div>

                                    {/* Chevron for affordance */}
                                    {action.type !== 'generic' && (
                                        <div className="text-amber-300 group-hover:text-amber-500 transition-colors text-lg">
                                            ➔
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Milestones Path */}
                <div className="space-y-4">
                    <h2 className="text-xs font-semibold text-[#5D8B75] uppercase tracking-widest flex items-center gap-2">
                        <span>🚀</span> My Journey
                    </h2>

                    {/* Seasonal Scroll Container */}
                    <div className="w-full overflow-x-auto overflow-y-hidden rounded-2xl border border-[#4A8268]/10 bg-white/50 shadow-inner backdrop-blur-sm">
                        <div className="flex min-w-max">
                            {milestones.map((m: any, idx: number) => {
                                // 1. Calculate Date & Season
                                const getSeasonInfo = (dob: string, ageStr: string) => {
                                    if (!dob) return { label: '---', styles: 'bg-gray-100', icon: '' }

                                    const months = parseInt(ageStr) || 0
                                    const d = new Date(dob)
                                    d.setMonth(d.getMonth() + months)

                                    const monthIndex = d.getMonth()
                                    const monthName = d.toLocaleString('default', { month: 'short' })
                                    const year = d.getFullYear()

                                    // Updated Season Themes for Harmony
                                    // Winter
                                    if (monthIndex === 11 || monthIndex <= 1) return {
                                        label: `${monthName} ${year}`,
                                        styles: 'bg-gradient-to-b from-sky-50/80 to-indigo-50/80 border-r border-sky-100',
                                        icon: '❄️',
                                        text: 'text-sky-900'
                                    }
                                    // Spring
                                    if (monthIndex >= 2 && monthIndex <= 4) return {
                                        label: `${monthName} ${year}`,
                                        styles: 'bg-gradient-to-b from-emerald-50/80 to-teal-50/80 border-r border-emerald-100',
                                        icon: '🌱',
                                        text: 'text-emerald-900'
                                    }
                                    // Summer
                                    if (monthIndex >= 5 && monthIndex <= 7) return {
                                        label: `${monthName} ${year}`,
                                        styles: 'bg-gradient-to-b from-amber-50/80 to-yellow-50/80 border-r border-amber-100',
                                        icon: '☀️',
                                        text: 'text-amber-900'
                                    }
                                    // Autumn
                                    return {
                                        label: `${monthName} ${year}`,
                                        styles: 'bg-gradient-to-b from-orange-50/80 to-rose-50/80 border-r border-orange-100',
                                        icon: '🍂',
                                        text: 'text-orange-900'
                                    }
                                }

                                const season = getSeasonInfo(child.birth_date, m.expected_age)

                                return (
                                    <div key={idx} className={`relative p-4 pb-8 flex flex-col items-center justify-between min-w-[160px] ${season.styles}`}>

                                        {/* Floating Card */}
                                        <div className={`w-full p-4 rounded-xl border flex flex-col items-center text-center relative z-10 transition-transform hover:-translate-y-1 ${m.state === 'WON' ? 'bg-white/90 border-yellow-200 shadow-sm' :
                                            m.state === 'ACTIVE' ? 'bg-white border-[#4A8268] shadow-lg ring-4 ring-[#4A8268]/10 scale-105 cursor-pointer hover:bg-[#4A8268]/5' :
                                                m.state === 'REVIEW' ? 'bg-amber-50 border-amber-300 shadow-md ring-2 ring-amber-100' :
                                                    'bg-white/40 border-gray-100 opacity-60 grayscale'
                                            }`}
                                            onClick={() => {
                                                if (m.state === 'ACTIVE') {
                                                    router.push(`/caregiver/child/${id}/record?milestone_id=${m.id}`)
                                                }
                                            }}
                                        >
                                            <div className="text-3xl mb-2">
                                                {m.state === 'WON' ? '🏆' : m.state === 'LOCKED' ? '🔒' : m.state === 'REVIEW' ? '⏳' : '⭐'}
                                            </div>
                                            <h3 className="font-bold text-sm text-gray-800 leading-tight mb-1">{m.title}</h3>
                                            <p className="text-[10px] text-gray-500">{m.expected_age}</p>

                                            {m.state === 'ACTIVE' && (
                                                <span className="absolute -top-3 bg-[#4A8268] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm blink-animation">
                                                    Pending
                                                </span>
                                            )}
                                            {m.state === 'REVIEW' && (
                                                <span className="absolute -top-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                    In Review
                                                </span>
                                            )}
                                        </div>

                                        {/* Connector Line */}
                                        <div className="h-6 w-0.5 bg-black/5 mt-2 mb-1"></div>

                                        {/* Season/Date Label */}
                                        <div className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wide opacity-80 ${season.text}`}>
                                            <span>{season.label}</span>
                                        </div>

                                        {/* Background Watermark Icon */}
                                        <div className="absolute bottom-2 right-2 text-6xl opacity-5 pointer-events-none select-none">
                                            {season.icon}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>


                {/* Recent Activity */}
                <div>
                    <h3 className="font-bold text-[#2C5F4B] mb-4 flex items-center gap-2">
                        <span>📋</span> Recent Activity
                    </h3>
                    <div className="space-y-4">
                        {timeline.map((event, idx) => (
                            <div key={idx}
                                className={`p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-[#4A8268]/10 transition-all ${event.evidence_url ? 'cursor-pointer hover:bg-white/80 hover:shadow-md' : ''}`}
                                onClick={() => {
                                    if (event.evidence_url) {
                                        setExpandedActivity(expandedActivity === idx ? null : idx)
                                    }
                                }}
                            >
                                <div className="flex gap-4">
                                    <div className="text-2xl pt-1 bg-[#FFFBF5] h-10 w-10 rounded-full flex items-center justify-center border border-[#4A8268]/10">{event.icon}</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-[#2C5F4B]">{event.title}</h4>
                                            {event.evidence_url && (
                                                <span className="text-xs text-[#2E8B99] font-medium px-2 py-1 bg-[#2E8B99]/10 rounded-full">
                                                    {expandedActivity === idx ? 'Close' : 'View Video'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#5D8B75] mb-1">
                                            {new Date(event.date).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-600">{event.description}</p>

                                        {/* Video Player */}
                                        {expandedActivity === idx && event.evidence_url && (
                                            <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                                                <div className="rounded-lg overflow-hidden bg-black shadow-md border border-gray-200 mb-4">
                                                    <video src={event.evidence_url} controls className="w-full max-h-60" autoPlay />
                                                </div>

                                                {/* Force Completion Button */}
                                                {event.status !== 'COMPLETED' && (
                                                    <div className="flex justify-center mb-2">
                                                        <Button size="sm" variant="destructive" onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleForceCompletion(event.id)
                                                        }}>
                                                            Force Completion
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
