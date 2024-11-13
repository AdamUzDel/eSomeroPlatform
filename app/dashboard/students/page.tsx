import { Suspense } from 'react'
import StudentsContent from './StudentsContent'
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function StudentsPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <h1 className="text-3xl font-bold ">Student Data</h1>
        <CardTitle className='hidden'>
          Student Data
        </CardTitle>
        <CardDescription>Select a class to view student data</CardDescription>
      </CardHeader>
        <Suspense fallback={<StudentsPageSkeleton />}>
          <StudentsContent />
        </Suspense>
    </Card>
  )
}

function StudentsPageSkeleton() {
  return (
    <div className="container mx-auto py-4 px-2 sm:px-6 lg:px-8">
      <Skeleton className="h-10 w-48 mb-8" />
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <Skeleton className="h-10 w-full sm:w-[180px]" />
        <Skeleton className="h-10 w-full sm:w-[300px]" />
      </div>
      <div className="flex justify-end space-x-2 mb-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}