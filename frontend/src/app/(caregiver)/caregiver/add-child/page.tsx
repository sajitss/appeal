"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export default function AddChildPage() {
    const router = useRouter()
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [dob, setDob] = useState("")
    const [sex, setSex] = useState("M")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [caregiverId, setCaregiverId] = useState<string | null>(null)

    useEffect(() => {
        const id = localStorage.getItem("caregiver_id")
        if (!id) {
            router.push("/caregiver/login")
        } else {
            setCaregiverId(id)
        }
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!caregiverId) return

        setLoading(true)
        setMessage("")

        try {
            await api.post("/patients/children/", {
                first_name: firstName,
                last_name: lastName,
                date_of_birth: dob,
                sex: sex,
                unique_child_id: `CID-${Math.floor(Math.random() * 100000)}`, // Random ID
                caregiver: caregiverId
            })
            // Redirect to dashboard on success
            router.push("/caregiver")
        } catch (error) {
            console.error("Error adding child", error)
            setMessage("Failed to add child. Please try again.")
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen bg-[#FFFBF5] overflow-hidden flex flex-col p-4 font-sans selection:bg-[#4A8268] selection:text-white">

            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-yellow-200/40 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#4A8268]/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-10 flex items-center gap-4 mb-8 pt-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-[#4A8268] hover:bg-[#4A8268]/10 hover:text-[#2C5F4B]">
                    ← Back
                </Button>
                <h1 className="text-2xl font-bold text-[#2C5F4B]">Add Child</h1>
            </div>

            <Card className="z-10 bg-white/80 backdrop-blur-md border border-white/50 shadow-xl ring-1 ring-[#4A8268]/5">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="text-center pb-2">
                        <div className="w-16 h-16 bg-[#FFFBF5] rounded-full flex items-center justify-center text-3xl mx-auto mb-2 border border-[#4A8268]/10 shadow-inner">
                            🐣
                        </div>
                        <CardTitle className="text-[#2C5F4B]">New Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-5 pt-2">
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="firstName" className="text-[#5D8B75] font-medium">First Name</Label>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                placeholder="e.g. Rahul"
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
                                placeholder="e.g. Kumar"
                                className="bg-white/50 border-[#4A8268]/20 focus:border-[#4A8268] focus:ring-[#4A8268]/20 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="dob" className="text-[#5D8B75] font-medium">Date of Birth</Label>
                                <Input
                                    id="dob"
                                    type="date"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    required
                                    className="bg-white/50 border-[#4A8268]/20 focus:border-[#4A8268] focus:ring-[#4A8268]/20 transition-all"
                                />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="sex" className="text-[#5D8B75] font-medium">Sex</Label>
                                <div className="relative">
                                    <select
                                        id="sex"
                                        className="flex h-10 w-full rounded-md border border-[#4A8268]/20 bg-white/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A8268]/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-700"
                                        value={sex}
                                        onChange={(e) => setSex(e.target.value)}
                                    >
                                        <option value="M">Male</option>
                                        <option value="F">Female</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {message && <p className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-100">{message}</p>}
                    </CardContent>
                    <CardFooter className="pb-6">
                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-medium bg-gradient-to-r from-[#4A8268] to-[#2E8B99] hover:from-[#3D6E57] hover:to-[#257A88] text-white border-0 shadow-lg shadow-[#4A8268]/20 rounded-xl transition-all hover:-translate-y-0.5"
                            disabled={loading}
                        >
                            {loading ? "Adding..." : "Add Child"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
