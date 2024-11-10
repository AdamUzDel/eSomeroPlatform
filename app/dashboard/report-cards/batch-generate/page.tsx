import { Suspense } from 'react'
import BatchGenerateReportCardsContent from './BatchGenerateReportCardsContent'

export default function BatchGenerateReportCardsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BatchGenerateReportCardsContent />
    </Suspense>
  )
}