// components/dashboard-content.tsx
"use client"

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const Overview = dynamic(() => import('@/components/dashboard/overview').then((mod) => mod.Overview), { ssr: false })
const RecentActivity = dynamic(() => import('@/components/dashboard/recent-activity').then((mod) => mod.RecentActivity), { ssr: false })
const StudentPerformance = dynamic(() => import('@/components/dashboard/student-performance').then((mod) => mod.StudentPerformance), { ssr: false })

export default function DashboardContent() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Dashboard</h1>
      <Suspense fallback={<div>Loading overview...</div>}>
        <Overview />
      </Suspense>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Suspense fallback={<div>Loading student performance...</div>}>
          <StudentPerformance />
        </Suspense>
        <Suspense fallback={<div>Loading recent activity...</div>}>
          <RecentActivity />
        </Suspense>
      </div>
    </div>
  )
}