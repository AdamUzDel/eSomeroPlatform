import { AddStudentMarks } from "@/components/AddStudentMarks";
import { classes, years, terms } from '@/types'

export default function AddMarksPage(){
    return (
        <div className="container mx-auto py-2">
          <h1 className="text-2xl font-bold mb-5">Add Student Marks</h1>
          <AddStudentMarks classes={classes} years={years} terms={terms} />
        </div>
      )
}