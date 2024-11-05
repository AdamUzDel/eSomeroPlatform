import { MarksOverview } from '@/components/MarksOverview'
import { classes, years, terms } from '@/types'

export default function MarksPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Marks Overview</h1>
      <MarksOverview classes={classes} years={years} terms={terms} />
    </div>
  )
}