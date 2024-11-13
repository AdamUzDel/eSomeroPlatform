import { MarksOverview } from '@/components/MarksOverview'
import { classes, years, terms } from '@/types'

export default function MarksPage() {
  return (
    <div className="container mx-auto py-4">
      <MarksOverview classes={classes} years={years} terms={terms} />
    </div>
  )
}