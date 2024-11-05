"use client"

import { EditStudentMarks } from "@/components/EditStudentMarks"
import { classes, years, terms } from '@/types'
import { useParams, notFound } from "next/navigation"

export default function EditStudentMarksPage() {
  const params = useParams()
  const studentId = params.studentId

  // Handle cases where studentId is undefined or an array
  if (!studentId || Array.isArray(studentId)) {
    notFound()
  }

  return (
    <div className="container mx-auto py-2">
      <h1 className="text-2xl font-bold mb-5">Edit Student Marks</h1>
      <EditStudentMarks classes={classes} years={years} terms={terms} studentId={studentId} />
    </div>
  )
}