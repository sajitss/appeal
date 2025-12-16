"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ChildSummary {
    id: string
    name: string
    age: string
    status: 'green' | 'amber' | 'red'
    status_indicator: string
}

export default function CaregiverDashboard() {
    const [children, setChildren] = useState<ChildSummary[]>([])
    const [greeting, setGreeting] = useState("")
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const loadDashboard = async () => {
            const id = localStorage.getItem("caregiver_id")
            if (!id) {
                router.push("/caregiver/login")
                return
            }

            try {
                const response = await api.get(`/caregiver/dashboard/?caregiver_id=${id}`)
                setChildren(response.data.children)
                setGreeting(response.data.greeting)
            } catch (err) {
                console.error(err)
                // If error, maybe auth invalid
            } finally {
                setLoading(false)
            }
        }
        loadDashboard()
    }, [router])

    if (loading) return <div className="p-8 text-center">Loading...</div>

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white p-4 border-b flex justify-between items-center sticky top-0 z-10">
                <div>
                    <span className="text-xs text-gray-500">APPEAL</span>
                    <h1 className="text-lg font-bold text-gray-800">{greeting || "Hello"}</h1>
                </div>
                <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">
                    {greeting ? greeting[7] : 'U'}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">My Children</h2>

                {children.map(child => (
                    <Card key={child.id} className="border-l-4 overflow-hidden"
                        style={{ borderLeftColor: child.status === 'green' ? '#10b981' : child.status === 'amber' ? '#f59e0b' : '#ef4444' }}
                        onClick={() => router.push(`/caregiver/child/${child.id}`)}
                    >
                        <CardContent className="p-4 flex items-center justify-between cursor-pointer active:bg-gray-50">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                                    👶
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{child.name}</h3>
                                    <p className="text-sm text-gray-500">{child.age}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-2xl ${child.status === 'green' ? 'text-green-500' : 'text-amber-500'}`}>
                                    {child.status === 'green' ? '✓' : '•'}
                                </div>
                                <p className="text-xs text-gray-400 max-w-[80px] leading-tight">{child.status_indicator}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {children.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No children linked to this account.
                    </div>
                )}

                <Button
                    className="w-full h-16 border-2 border-dashed border-gray-300 bg-transparent text-gray-500 hover:bg-gray-50 hover:border-amber-400 hover:text-amber-600 flex items-center justify-center gap-2 text-lg font-semibold mt-4 rounded-xl"
                    onClick={() => router.push('/caregiver/add-child')}
                >
                    <span className="text-3xl font-light">+</span> Add Child
                </Button>
            </div>

            {/* Bottom Nav (Placeholder) */}
            <div className="bg-white border-t p-2 flex justify-around text-xs text-gray-400">
                <div className="p-2 text-amber-600 font-bold">Home</div>
                <div className="p-2">Profile</div>
                <div className="p-2" onClick={() => { localStorage.clear(); router.push('/caregiver/login') }}>Logout</div>
            </div>
        </div>
    )
}
