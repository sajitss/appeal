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
        <div className="min-h-screen bg-gray-50 flex flex-col p-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    ← Back
                </Button>
                <h1 className="text-xl font-bold text-gray-800">Add Child</h1>
            </div>

            <Card className="border-amber-100 shadow-md">
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4 pt-6">
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="e.g. Rahul" />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="e.g. Kumar" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="sex">Sex</Label>
                                <select
                                    id="sex"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={sex}
                                    onChange={(e) => setSex(e.target.value)}
                                >
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                            </div>
                        </div>

                        {message && <p className="text-red-500 text-sm">{message}</p>}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={loading}>
                            {loading ? "Adding..." : "Add Child"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
