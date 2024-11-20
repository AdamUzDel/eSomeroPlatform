import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Class, Subject } from '@/types'

interface SubjectInputsProps {
  selectedClass: string
  classes: Class[]
  subjects: { [key: string]: number } | undefined
}

export default function SubjectInputs({ selectedClass, classes, subjects }: SubjectInputsProps) {
  const classSubjects = classes.find(cls => cls.name === selectedClass)?.subjects || []

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Subject Marks</h3>
      {classSubjects.map((subject: Subject) => (
        <div key={subject.code} className="flex items-center space-x-2">
          <Label htmlFor={subject.code} className="w-1/3">{subject.name}</Label>
          <Input
            id={subject.code}
            name={subject.code}
            type="number"
            min="0"
            max="100"
            defaultValue={subjects && subjects[subject.code] ? subjects[subject.code] : ''}
            placeholder="Enter mark"
            className="w-2/3"
          />
        </div>
      ))}
    </div>
  )
}