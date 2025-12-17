"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "react-i18next"

export default function CaregiverLoginPage() {
    const { t } = useTranslation()
    const [phoneNumber, setPhoneNumber] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        try {
            const response = await api.post("/caregiver/login/", {
                phone_number: phoneNumber,
                password: password
            })

            localStorage.setItem("caregiver_id", response.data.caregiver_id)
            localStorage.setItem("caregiver_name", response.data.caregiver_name)

            router.push("/caregiver")
        } catch (err: any) {
            console.error("Login failed", err)
            setError(err.response?.data?.error || "Invalid credentials.")
        }
    }

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#FFFBF5] overflow-hidden p-4 font-sans selection:bg-[#4A8268] selection:text-white">

            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-yellow-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#4A8268]/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
            <div className="absolute top-[20%] right-[10%] w-32 h-32 bg-orange-200/30 rounded-full blur-2xl"></div>

            <div className="mb-8 text-center z-10">
                {/* Icon/Logo Placeholder */}
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-white shadow-sm ring-4 ring-[#4A8268]/10 text-3xl">
                    🌱
                </div>
                <h1 className="text-3xl font-bold text-[#2C5F4B] tracking-tight">APPEAL For Parents</h1>
                <p className="text-[#5D8B75] mt-2">{t('login.subtitle')}</p>
            </div>

            <Card className="w-full max-w-sm border-0 shadow-xl bg-white/80 backdrop-blur-md ring-1 ring-white/50 z-10">
                <CardHeader className="pb-2 text-center">
                    <CardTitle className="text-xl text-gray-800">{t('login.welcome')}</CardTitle>
                    <CardDescription className="text-gray-500">Let's check in on your little one's progress.</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-5 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-gray-700 font-medium">{t('login.mobile_label')}</Label>
                            <Input
                                id="phone"
                                placeholder={t('login.mobile_placeholder')}
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                type="tel"
                                required
                                className="bg-white/50 border-gray-200 focus:border-[#4A8268] focus:ring-[#4A8268]/20 transition-all rounded-lg h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700 font-medium">{t('login.password_label')}</Label>
                            <Input
                                id="password"
                                placeholder={t('login.password_placeholder')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                required
                                className="bg-white/50 border-gray-200 focus:border-[#4A8268] focus:ring-[#4A8268]/20 transition-all rounded-lg h-11"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="pt-2 pb-6">
                        <Button type="submit" className="w-full h-12 text-lg font-medium bg-gradient-to-r from-[#4A8268] to-[#2E8B99] hover:from-[#3D6E57] hover:to-[#257A88] text-white border-0 shadow-lg shadow-[#4A8268]/20 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0">
                            {t('login.button')}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <p className="text-xs text-[#5D8B75]/80 mt-8 text-center max-w-xs z-10 font-medium">
                {t('login.footer')}
            </p>
        </div>
    )
}
