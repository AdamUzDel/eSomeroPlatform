// components/dashboard/student-performance.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  { subject: "Math", score: 80 },
  { subject: "English", score: 75 },
  { subject: "Science", score: 85 },
  { subject: "History", score: 70 },
  { subject: "Art", score: 90 },
]

export function StudentPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis dataKey="subject" />
            <YAxis />
            <Bar dataKey="score" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}