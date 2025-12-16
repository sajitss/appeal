"use client"

import { useState } from "react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export default function AddPatientForm({ onSuccess }: { onSuccess: () => void }) {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [dob, setDob] = useState("")
    const [sex, setSex] = useState("M")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")

        try {
            await api.post("/patients/children/", {
                first_name: firstName,
                last_name: lastName,
                date_of_birth: dob,
                sex: sex,
                // generate a random unique ID for demo
                unique_child_id: `CID-${Math.floor(Math.random() * 10000)}`
            })
            setMessage("Patient added successfully!")
            setFirstName("")
            setLastName("")
            setDob("")
            onSuccess() // Refresh list
        } catch (error) {
            console.error("Error adding patient", error)
            setMessage("Failed to add patient.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Patient</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="sex">Sex</Label>
                            {/* Simple select for now, using native for speed or Shadcn Select if setup */}
                            <select
                                id="sex"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={sex}
                                onChange={(e) => setSex(e.target.value)}
                            >
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                            </select>
                        </div>
                    </div>
                    {message && <p className={message.includes("Success") ? "text-green-600" : "text-red-500"}>{message}</p>}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Patient"}</Button>
                </CardFooter>
            </form>
        </Card>
    )
}
