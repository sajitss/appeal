"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import PatientList from "@/components/PatientList"
import AddPatientForm from "@/components/AddPatientForm"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await api.get("/core/users/")
        setUser({ name: "Authenticated User" })
      } catch (err) {
        console.error("Auth check failed", err)
        router.push("/login")
      }
    }
    fetchUser()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  const handlePatientAdded = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Appeal Dashboard</h1>
        <Button onClick={handleLogout} variant="destructive">Logout</Button>
      </div>

      <div className="grid gap-6">
        <div className="grid md:grid-cols-2 gap-6">
          <AddPatientForm onSuccess={handlePatientAdded} />
        </div>
        <PatientList key={refreshKey} />
      </div>
    </div>
  )
}
