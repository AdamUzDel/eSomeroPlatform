import { Suspense } from 'react'
import ReportCardsContent from './ReportCardsContent'
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReportCardsPage() {
  return (
    <Card className="mx-4">
      <CardHeader>
        <h1 className="text-3xl font-bold ">Student Report Cards</h1>
        <CardTitle className='hidden'>
          Student Report Cards
        </CardTitle>
        <CardDescription>Select a class and year to view student report cards</CardDescription>
      </CardHeader>
      <Suspense fallback={<ReportCardsSkeleton />}>
        <ReportCardsContent />
      </Suspense>
    </Card>
  )
}

function ReportCardsSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 w-full sm:w-[200px]" />
        <Skeleton className="h-10 w-full sm:w-[200px]" />
        <Skeleton className="h-10 w-full sm:w-[300px]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}