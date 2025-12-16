"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Child {
    id: number
    unique_child_id: string
    first_name: string
    last_name: string
    date_of_birth: string
    gender: string
}

export default function PatientList() {
    const [children, setChildren] = useState<Child[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const response = await api.get("/patients/children/")
                setChildren(response.data.results || response.data) // Handle pagination or direct list
            } catch (error) {
                console.error("Failed to fetch patients", error)
            } finally {
                setLoading(false)
            }
        }

        fetchChildren()
    }, [])

    if (loading) {
        return <div>Loading patients...</div>
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Registered Patients (Children)</CardTitle>
            </CardHeader>
            <CardContent>
                {children.length === 0 ? (
                    <p>No patients found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">ID</th>
                                    <th className="text-left p-2">Name</th>
                                    <th className="text-left p-2">DOB</th>
                                    <th className="text-left p-2">Gender</th>
                                </tr>
                            </thead>
                            <tbody>
                                {children.map((child) => (
                                    <tr key={child.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2 font-medium">{child.unique_child_id}</td>
                                        <td className="p-2">{child.first_name} {child.last_name}</td>
                                        <td className="p-2">{child.date_of_birth}</td>
                                        <td className="p-2 capitalize">{child.gender}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
