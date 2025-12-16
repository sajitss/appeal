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
    status: 'green' | 'amber' | 'red' | 'blue'
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

    if (loading) return <div className="p-8 text-center text-[#4A8268]">Loading...</div>

    return (
        <div className="relative min-h-screen bg-[#FFFBF5] overflow-hidden flex flex-col font-sans selection:bg-[#4A8268] selection:text-white">

            {/* Background Decorative Blobs */}
            <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-[#4A8268]/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-30%] w-[500px] h-[500px] bg-yellow-200/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-[#4A8268]/10 p-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                <div>
                    <span className="text-xs font-bold tracking-widest text-[#4A8268]/60 uppercase">APPEAL</span>
                    <h1 className="text-xl font-bold text-[#2C5F4B]">{greeting || "Hello"}</h1>
                </div>
                <div className="h-10 w-10 bg-[#4A8268]/10 ring-2 ring-[#4A8268]/20 rounded-full flex items-center justify-center text-[#2C5F4B] font-bold shadow-sm">
                    {greeting ? greeting[7] : 'U'}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-5 z-10 relative">
                <h2 className="text-sm font-semibold text-[#5D8B75] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span>🌱</span> My Children
                </h2>

                {children.map(child => (
                    <Card key={child.id} className="border-0 shadow-lg shadow-[#4A8268]/5 ring-1 ring-black/5 overflow-hidden transition-all hover:scale-[1.01] hover:shadow-xl group bg-white/90 backdrop-blur-sm"
                        onClick={() => router.push(`/caregiver/child/${child.id}`)}
                    >
                        <div className={`h-1.5 w-full ${child.status === 'green' ? 'bg-[#4A8268]' : child.status === 'blue' ? 'bg-[#2E8B99]' : child.status === 'amber' ? 'bg-amber-400' : 'bg-red-400'}`}></div>
                        <CardContent className="p-5 flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 bg-[#FFFBF5] border border-[#4A8268]/10 rounded-full flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                                    👶
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[#2C5F4B] group-hover:text-[#1a3d30] transition-colors">{child.name}</h3>
                                    <p className="text-sm text-[#5D8B75] font-medium">{child.age}</p>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <div className={`text-2xl mb-1 ${child.status === 'green' ? 'text-[#4A8268]' :
                                    child.status === 'blue' ? 'text-[#2E8B99]' :
                                        child.status === 'amber' ? 'text-amber-500' : 'text-red-500'
                                    }`}>
                                    {child.status === 'green' ? '✓' : child.status === 'blue' ? '⏳' : '•'}
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${child.status === 'green' ? 'bg-[#4A8268]/10 text-[#4A8268]' :
                                    child.status === 'blue' ? 'bg-[#2E8B99]/10 text-[#2E8B99]' :
                                        child.status === 'amber' ? 'bg-amber-100 text-amber-700' :
                                            'bg-red-100 text-red-700'
                                    }`}>
                                    {child.status_indicator}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {children.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-[#4A8268]/5 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-pulse">
                            ✨
                        </div>
                        <h3 className="text-[#2C5F4B] font-bold text-lg mb-1">Start Your Journey</h3>
                        <p className="text-[#5D8B75] text-sm max-w-xs mx-auto">Add your child to begin tracking milestones and health progress.</p>
                    </div>
                )}

                <Button
                    className="w-full h-16 border-2 border-dashed border-[#4A8268]/30 bg-[#4A8268]/5 text-[#4A8268] hover:bg-[#4A8268]/10 hover:border-[#4A8268]/50 flex items-center justify-center gap-2 text-lg font-semibold mt-4 rounded-xl transition-all active:scale-[0.98]"
                    onClick={() => router.push('/caregiver/add-child')}
                >
                    <span className="text-2xl font-light">+</span> Add Child
                </Button>

                {/* Footer / Logout (Optional) */}
                <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-[#4A8268]/10 p-3 flex justify-around text-xs font-medium text-[#5D8B75] z-20">
                    <div className="flex flex-col items-center gap-1 opacity-100 text-[#2C5F4B]">
                        <span className="text-lg">🏠</span>
                        Home
                    </div>
                    <div className="flex flex-col items-center gap-1 opacity-50 cursor-pointer hover:opacity-100 hover:text-[#285e68] transition-all" onClick={() => router.push('/caregiver/profile')}>
                        <span className="text-lg">👤</span>
                        Profile
                    </div>
                    <div className="flex flex-col items-center gap-1 opacity-50" onClick={() => {
                        localStorage.clear()
                        router.push('/caregiver/login')
                    }}>
                        <span className="text-lg">🚪</span>
                        Logout
                    </div>
                </div>
                <div className="h-16"></div> {/* Spacer for fixed footer */}
            </div>
        </div>
    )
}
