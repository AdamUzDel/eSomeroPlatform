// components/dashboard/recent-activity.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          <li className="flex items-center">
            <span className="mr-2 h-2 w-2 rounded-full bg-blue-500"></span>
            <span className="flex-1">John Doe added to Class 2A</span>
            <span className="text-sm text-muted-foreground">2 hours ago</span>
          </li>
          <li className="flex items-center">
            <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
            <span className="flex-1">Term 1 results uploaded for Class 3B</span>
            <span className="text-sm text-muted-foreground">Yesterday</span>
          </li>
          {/* Add more activity items */}
        </ul>
      </CardContent>
    </Card>
  )
}