"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export default function ProfilePage() {
    const router = useRouter()
    const [caregiver, setCaregiver] = useState<any>(null)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [phone, setPhone] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            const id = localStorage.getItem("caregiver_id")
            if (!id) {
                router.push("/caregiver/login")
                return
            }

            try {
                // Assuming we can fetch by ID directly
                const response = await api.get(`/patients/caregivers/${id}/`)
                const data = response.data
                setCaregiver(data)
                setFirstName(data.first_name)
                setLastName(data.last_name)
                setPhone(data.phone_number)
            } catch (error: any) {
                console.error("Failed to load profile", error)
                const detail = error.response?.data?.detail || error.message || "Unknown error"
                setMessage({ text: `Failed to load profile: ${detail}`, type: 'error' })
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [router])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!caregiver) return

        setSaving(true)
        setMessage(null)

        try {
            await api.patch(`/patients/caregivers/${caregiver.id}/`, {
                first_name: firstName,
                last_name: lastName,
                phone_number: phone
            })
            // Update local storage name if changed
            localStorage.setItem("caregiver_name", `${firstName} ${lastName}`)
            setMessage({ text: "Profile updated successfully!", type: 'success' })
        } catch (error) {
            console.error("Failed to update profile", error)
            setMessage({ text: "Failed to update profile.", type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-[#4A8268]">Loading...</div>

    return (
        <div className="relative min-h-screen bg-[#FFFBF5] overflow-hidden flex flex-col p-4 font-sans selection:bg-[#4A8268] selection:text-white">

            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-yellow-200/40 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#4A8268]/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-10 flex items-center gap-4 mb-8 pt-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-[#4A8268] hover:bg-[#4A8268]/10 hover:text-[#2C5F4B]">
                    ← Back
                </Button>
                <h1 className="text-2xl font-bold text-[#2C5F4B]">My Profile</h1>
            </div>

            <Card className="z-10 bg-white/80 backdrop-blur-md border border-white/50 shadow-xl ring-1 ring-[#4A8268]/5 max-w-md w-full mx-auto">
                <form onSubmit={handleSave}>
                    <CardHeader className="text-center pb-2">
                        <div className="w-20 h-20 bg-[#FFFBF5] rounded-full flex items-center justify-center text-4xl mx-auto mb-2 border border-[#4A8268]/10 shadow-inner ring-4 ring-white">
                            👤
                        </div>
                        <CardTitle className="text-[#2C5F4B] text-xl">Edit Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-5 pt-2">

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="firstName" className="text-[#5D8B75] font-medium">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="bg-white/50 border-[#4A8268]/20 focus:border-[#4A8268] focus:ring-[#4A8268]/20 transition-all"
                                />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="lastName" className="text-[#5D8B75] font-medium">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="bg-white/50 border-[#4A8268]/20 focus:border-[#4A8268] focus:ring-[#4A8268]/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="phone" className="text-[#5D8B75] font-medium">Mobile Number</Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                type="tel"
                                className="bg-white/50 border-[#4A8268]/20 focus:border-[#4A8268] focus:ring-[#4A8268]/20 transition-all"
                            />
                        </div>

                        {/* Read Only Info */}
                        <div className="p-3 bg-[#4A8268]/5 rounded-lg border border-[#4A8268]/10">
                            <p className="text-xs text-[#5D8B75] uppercase tracking-wider font-bold mb-1">Account Role</p>
                            <p className="text-[#2C5F4B] font-medium">{caregiver?.relationship || 'Guardian'}</p>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                <span>{message.type === 'success' ? '✅' : '⚠️'}</span> {message.text}
                            </div>
                        )}

                    </CardContent>
                    <CardFooter className="pb-6">
                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-medium bg-gradient-to-r from-[#4A8268] to-[#2E8B99] hover:from-[#3D6E57] hover:to-[#257A88] text-white border-0 shadow-lg shadow-[#4A8268]/20 rounded-xl transition-all hover:-translate-y-0.5"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
