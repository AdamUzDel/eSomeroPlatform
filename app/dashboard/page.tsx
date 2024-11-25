// app/dashboard/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, ChevronRight } from "lucide-react"
import Link from 'next/link'

export default function DashboardPage() {
  // Mock data (replace with actual data fetching logic later)
  const notifications = [
    { id: 1, message: "New student registered", time: "2 hours ago" },
    { id: 2, message: "Report cards ready for Class 8", time: "1 day ago" },
    { id: 3, message: "Staff meeting scheduled for Friday", time: "2 days ago" },
  ]

  const studentPerformance = [
    { id: 1, name: "Alice Barnaba", class: "PREP A", average: 85 },
    { id: 2, name: "Mathew Albino", class: "S3A", average: 78 },
    { id: 3, name: "Adam Musa", class: "S2B", average: 92 },
  ]

  return (
    <div className="px-4">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Total Students" value="500" />
        <DashboardCard title="Average Performance" value="78%" />
        <DashboardCard title="Upcoming Events" value="3" />
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li key={notification.id} className="flex items-start">
                  <Bell className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm font-medium">{notification.message}</p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Button variant="link" className="mt-4">
              View all notifications
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Student Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {studentPerformance.map((student) => (
                <li key={student.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.class}</p>
                  </div>
                  <div className="text-sm font-semibold">{student.average}%</div>
                </li>
              ))}
            </ul>
            <Link href={"/dashboard/students"}>
              <Button variant="link" className="mt-4">
                View all students
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardCard({ title, value }: { title: string, value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}