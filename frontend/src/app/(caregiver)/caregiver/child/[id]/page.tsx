"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TimelineEvent {
    type: string
    title: string
    date: string
    icon: string
    description: string
}

export default function ChildTimeline({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [child, setChild] = useState<any>(null)
    const [timeline, setTimeline] = useState<TimelineEvent[]>([])
    const [milestones, setMilestones] = useState<any[]>([])
    const [nextAction, setNextAction] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/caregiver/child/${id}/`)
                setChild(response.data.child)
                setTimeline(response.data.timeline)
                setMilestones(response.data.milestones)
                setNextAction(response.data.next_action)
            } catch (error) {
                console.error("Failed to load timeline", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    if (loading) return <div className="p-8 text-center">Loading...</div>
    if (!child) return <div className="p-8 text-center">Child not found</div>

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white p-4 border-b flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    ←
                </Button>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">{child.name}</h1>
                    <p className="text-xs text-gray-500">{child.age}</p>
                </div>
            </div>

            <div className="flex-1 p-4 space-y-6">

                {/* Next Action */}
                {nextAction && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">🎥</span>
                            <div>
                                <h3 className="font-bold text-amber-900">{nextAction.title}</h3>
                                <p className="text-xs text-amber-700">{nextAction.description}</p>
                            </div>
                        </div>
                        <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={() => router.push(`/caregiver/child/${id}/record`)}
                        >
                            {nextAction.action_label}
                        </Button>
                    </div>
                )}

                {/* Milestones Path */}
                <div className="space-y-4">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">My Journey</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {milestones.map((m: any, idx: number) => (
                            <div key={idx} className={`min-w-[140px] p-4 rounded-xl border flex flex-col items-center text-center relative ${m.state === 'WON' ? 'bg-yellow-50 border-yellow-200' :
                                m.state === 'ACTIVE' ? 'bg-white border-blue-200 shadow-md ring-2 ring-blue-100' :
                                    'bg-gray-50 border-gray-100 opacity-70 grayscale'
                                }`}>
                                <div className="text-3xl mb-2">
                                    {m.state === 'WON' ? '🏆' : m.state === 'LOCKED' ? '🔒' : '⭐'}
                                </div>
                                <h3 className="font-bold text-sm text-gray-800 leading-tight mb-1">{m.title}</h3>
                                <p className="text-[10px] text-gray-500">{m.expected_age}</p>

                                {m.state === 'ACTIVE' && (
                                    <span className="absolute -top-2 bg-blue-500 text-white text-[9px] px-2 py-0.5 rounded-full">
                                        Current
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Recent Activity</h2>

                    {timeline.map((event, idx) => (
                        <div key={idx} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="h-8 w-8 bg-white border rounded-full flex items-center justify-center shadow-sm">
                                    {event.icon}
                                </div>
                                {idx < timeline.length - 1 && <div className="w-0.5 h-full bg-gray-200 my-1"></div>}
                            </div>
                            <div className="bg-white p-3 rounded-lg border shadow-sm flex-1 mb-2">
                                <h4 className="font-bold text-gray-800 text-sm">{event.title}</h4>
                                <p className="text-xs text-gray-500">{event.description}</p>
                                <p className="text-[10px] text-gray-300 mt-1">{new Date(event.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
