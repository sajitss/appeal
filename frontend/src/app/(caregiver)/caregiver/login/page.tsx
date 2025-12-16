"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CaregiverLoginPage() {
    const [phoneNumber, setPhoneNumber] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        try {
            const response = await api.post("/caregiver/login/", {
                phone_number: phoneNumber,
                password: password
            })

            // Store simplified auth details
            localStorage.setItem("caregiver_id", response.data.caregiver_id)
            localStorage.setItem("caregiver_name", response.data.caregiver_name)

            router.push("/caregiver") // Redirect to dashboard
        } catch (err: any) {
            console.error("Login failed", err)
            setError(err.response?.data?.error || "Invalid credentials. Please check Phone and Password.")
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50 p-4">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-amber-900">APPEAL For Parents</h1>
                <p className="text-amber-700">Track your child's health journey</p>
            </div>

            <Card className="w-full max-w-sm border-amber-200">
                <CardHeader>
                    <CardTitle>Welcome</CardTitle>
                    <CardDescription>Enter your mobile number and password to login.</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Mobile Number</Label>
                            <Input
                                id="phone"
                                placeholder="e.g. 9876543210"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                type="tel"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700">Login</Button>
                    </CardFooter>
                </form>
            </Card>

            <p className="text-xs text-gray-500 mt-8 text-center max-w-xs">
                Your privacy is important to us. <br /> Records are only shared with your doctor.
            </p>
        </div>
    )
}
