"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        try {
            const response = await api.post("/api-token-auth/", { username, password })
            const token = response.data.token
            localStorage.setItem("token", token)
            router.push("/") // Redirect to dashboard
        } catch (err: any) {
            console.error("Login failed", err)
            setError("Invalid credentials")
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Enter your credentials to access the system.</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button type="submit" className="w-full">Login</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
