"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useTranslation } from "react-i18next"

export default function ProfilePage() {
    const { t, i18n } = useTranslation()
    const router = useRouter()
    const [caregiver, setCaregiver] = useState<any>(null)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [phone, setPhone] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const fetchProfile = async () => {
        const id = localStorage.getItem("caregiver_id")
        if (!id) {
            router.push("/caregiver/login")
            return
        }

        try {
            const response = await api.get(`/patients/caregivers/${id}/`)
            const data = response.data
            setCaregiver(data)
            setFirstName(data.first_name)
            setLastName(data.last_name)
            setPhone(data.phone_number)
            if (data.language_preference) {
                i18n.changeLanguage(data.language_preference.toLowerCase())
            }
        } catch (error: any) {
            console.error("Failed to load profile", error)
            const detail = error.response?.data?.detail || error.message || "Unknown error"
            setMessage({ text: `Failed to load profile: ${detail}`, type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                phone_number: phone,
                language_preference: i18n.language.toUpperCase()
            })
            // Update local storage name if changed
            localStorage.setItem("caregiver_name", `${firstName} ${lastName}`)
            setMessage({ text: "Profile updated successfully!", type: 'success' })
            fetchProfile()
        } catch (error) {
            console.error("Failed to update profile", error)
            setMessage({ text: "Failed to update profile.", type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang)
    }

    const [showInviteModal, setShowInviteModal] = useState(false)
    const [inviteName, setInviteName] = useState("")
    const [invitePhone, setInvitePhone] = useState("")
    const [inviteRelationship, setInviteRelationship] = useState("MOTHER")
    const [inviting, setInviting] = useState(false)

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!caregiver) return

        setInviting(true)
        setMessage(null)

        try {
            await api.post('/caregiver/add-member/', {
                caregiver_id: caregiver.id,
                phone_number: invitePhone,
                first_name: inviteName,
                relationship: inviteRelationship
            })
            setMessage({ text: t('profile.success_message') || "Member added successfully!", type: 'success' })
            setShowInviteModal(false)
            setInviteName("")
            setInvitePhone("")
            setInviteRelationship("MOTHER")
            fetchProfile()
        } catch (error: any) {
            console.error("Failed to add member", error)
            const detail = error.response?.data?.detail || error.response?.data?.error || "Failed to add member"
            setMessage({ text: detail, type: 'error' })
        } finally {
            setInviting(false)
        }
    }

    if (!mounted) return null // Prevent hydration mismatch

    if (loading) return <div className="p-8 text-center text-[#4A8268]">{t('common.loading')}</div>

    return (
        <div className="relative min-h-screen bg-[#FFFBF5] overflow-hidden flex flex-col p-4 font-sans selection:bg-[#4A8268] selection:text-white">

            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-yellow-200/40 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#4A8268]/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-10 flex items-center gap-4 mb-8 pt-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-[#4A8268] hover:bg-[#4A8268]/10 hover:text-[#2C5F4B]">
                    ← {t('common.back')}
                </Button>
                <h1 className="text-2xl font-bold text-[#2C5F4B]">{t('profile.title')}</h1>
            </div>

            <div className="max-w-md w-full mx-auto space-y-6">
                <Card className="z-10 bg-white/80 backdrop-blur-md border border-white/50 shadow-xl ring-1 ring-[#4A8268]/5">
                    <form onSubmit={handleSave}>
                        {/* Profile Form Content (Unchanged) */}
                        <CardHeader className="text-center pb-2">
                            <div className="w-20 h-20 bg-[#FFFBF5] rounded-full flex items-center justify-center text-4xl mx-auto mb-2 border border-[#4A8268]/10 shadow-inner ring-4 ring-white">
                                👤
                            </div>
                            <CardTitle className="text-[#2C5F4B] text-xl">{t('profile.edit_details')}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-5 pt-2">

                            {/* Language Selector */}
                            <div className="flex flex-col space-y-2">
                                <Label className="text-[#5D8B75] font-medium">{t('profile.language_preference') || "App Language"}</Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={i18n.language === 'en' ? 'default' : 'outline'}
                                        className={i18n.language === 'en' ? 'bg-[#4A8268] hover:bg-[#3D6E57]' : 'border-[#4A8268]/20 text-[#4A8268]'}
                                        onClick={() => changeLanguage('en')}
                                    >
                                        English
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={i18n.language === 'hi' ? 'default' : 'outline'}
                                        className={i18n.language === 'hi' ? 'bg-[#4A8268] hover:bg-[#3D6E57]' : 'border-[#4A8268]/20 text-[#4A8268]'}
                                        onClick={() => changeLanguage('hi')}
                                    >
                                        हिंदी
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={i18n.language === 'kn' ? 'default' : 'outline'}
                                        className={i18n.language === 'kn' ? 'bg-[#4A8268] hover:bg-[#3D6E57]' : 'border-[#4A8268]/20 text-[#4A8268]'}
                                        onClick={() => changeLanguage('kn')}
                                    >
                                        ಕನ್ನಡ
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="firstName" className="text-[#5D8B75] font-medium">{t('profile.first_name')}</Label>
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className="bg-white/50 border-[#4A8268]/20 focus:border-[#4A8268] focus:ring-[#4A8268]/20 transition-all"
                                    />
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="lastName" className="text-[#5D8B75] font-medium">{t('profile.last_name')}</Label>
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
                                <Label htmlFor="phone" className="text-[#5D8B75] font-medium">{t('profile.mobile')}</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    type="tel"
                                    className="bg-white/50 border-[#4A8268]/20 focus:border-[#4A8268] focus:ring-[#4A8268]/20 transition-all"
                                />
                            </div>

                            <div className="p-3 bg-[#4A8268]/5 rounded-lg border border-[#4A8268]/10">
                                <p className="text-xs text-[#5D8B75] uppercase tracking-wider font-bold mb-1">{t('profile.role')}</p>
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
                                {saving ? t('profile.saving') : t('profile.save')}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Family Management Card */}
                <Card className="z-10 bg-white/80 backdrop-blur-md border border-white/50 shadow-xl ring-1 ring-[#4A8268]/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[#2C5F4B] text-xl flex items-center gap-2">
                            <span>👨‍👩‍👧‍👦</span> {t('profile.family_title', 'My Family')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                        {/* Member List */}
                        {caregiver?.family_members && caregiver.family_members.length > 0 ? (
                            <div className="space-y-2">
                                {caregiver.family_members.map((member: any) => (
                                    <div key={member.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#4A8268]/10 shadow-sm">
                                        <div className="w-10 h-10 bg-[#4A8268]/10 rounded-full flex items-center justify-center text-lg">
                                            {member.relationship === 'FATHER' ? '👨' : (member.relationship === 'MOTHER' ? '👩' : '👤')}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-[#2C5F4B]">{member.first_name} {member.last_name}</p>
                                            <p className="text-xs text-[#5D8B75] capitalize">{member.relationship?.toLowerCase() || 'Member'}</p>
                                        </div>
                                        <div className="text-xs text-[#5D8B75]/70 bg-[#4A8268]/5 px-2 py-1 rounded">
                                            {member.phone_number}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-[#5D8B75] text-sm py-2">No other family members yet.</p>
                        )}

                        <div className="p-4 bg-[#4A8268]/5 rounded-xl border border-[#4A8268]/10 text-center space-y-3">
                            <p className="text-[#5D8B75] text-sm">
                                {t('profile.login_credential_notice') || `Current Login: ${caregiver?.phone_number} / appeal`}
                            </p>
                            <Button
                                onClick={() => setShowInviteModal(true)}
                                variant="outline"
                                className="w-full border-[#4A8268] text-[#4A8268] hover:bg-[#4A8268] hover:text-white transition-colors"
                            >
                                + {t('profile.invite_btn', 'Invite Member')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Invite Modal Overlay */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <Card className="w-full max-w-sm bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                        <CardHeader>
                            <CardTitle className="text-[#2C5F4B]">{t('profile.invite_title', 'Invite Family Member')}</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleInvite}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>{t('profile.first_name')}</Label>
                                    <Input
                                        value={inviteName}
                                        onChange={e => setInviteName(e.target.value)}
                                        placeholder="e.g. Priya"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('profile.mobile')}</Label>
                                    <Input
                                        value={invitePhone}
                                        onChange={e => setInvitePhone(e.target.value)}
                                        placeholder="10-digit number"
                                        type="tel"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('profile.relationship')}</Label>
                                    <select
                                        className="w-full h-10 px-3 rounded-md border border-input bg-white text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={inviteRelationship}
                                        onChange={e => setInviteRelationship(e.target.value)}
                                    >
                                        <option value="MOTHER">Mother</option>
                                        <option value="FATHER">Father</option>
                                        <option value="GUARDIAN">Guardian</option>
                                        <option value="GRANDMOTHER">Grandmother</option>
                                        <option value="GRANDFATHER">Grandfather</option>
                                    </select>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setShowInviteModal(false)}>
                                    {t('common.back') || 'Cancel'}
                                </Button>
                                <Button type="submit" disabled={inviting} className="bg-[#4A8268] hover:bg-[#3D6E57] text-white">
                                    {inviting ? t('profile.saving') : t('profile.add_member')}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    )
}
