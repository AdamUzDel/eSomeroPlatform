"use client"

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'sonner'
import { Class } from '@/types'
import { getStudentMarks, updateStudentMarks } from '@/lib/firebaseUtils'

const SubjectInputs = dynamic(() => import('./SubjectInputs'), { 
  loading: () => <p>Loading subjects...</p>,
  ssr: false // This replaces the 'suspense' option
})

interface EditStudentMarksProps {
  classes: Class[]
  years: string[]
  terms: string[]
  studentId: string
}

export function EditStudentMarks({ classes, years, terms, studentId }: EditStudentMarksProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedClass, setSelectedClass] = useState<string>(searchParams.get('class') || classes[0]?.name || '')
  const [selectedYear, setSelectedYear] = useState<string>(searchParams.get('year') || years[0] || '')
  const [selectedTerm, setSelectedTerm] = useState<string>(searchParams.get('term') || terms[0] || '')
  const [studentName, setStudentName] = useState<string>(searchParams.get('studentName') || '')
  const [subjects, setSubjects] = useState<{ [key: string]: number }>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isUpdating, setIsUpdating] = useState<boolean>(false)

  const fetchStudentMarks = useCallback(async () => {
    if (!studentId) {
      toast.error('Invalid student ID')
      return
    }
    setIsLoading(true)
    try {
      const marks = await getStudentMarks(selectedClass, selectedYear, selectedTerm)
      const studentMark = marks.find(mark => mark.id === studentId)
      if (studentMark) {
        setStudentName(studentMark.name)
        setSubjects(studentMark.subjects)
        toast.success('Student marks fetched successfully')
      } else {
        setSubjects({})
        toast.error('Student marks not found for the selected criteria')
      }
    } catch (error) {
      console.error('Error fetching student marks:', error)
      toast.error('Failed to fetch student marks. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [studentId, selectedClass, selectedYear, selectedTerm])

  useEffect(() => {
    if (studentId) {
      fetchStudentMarks()
    }
  }, [fetchStudentMarks])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!studentId) {
      toast.error('Invalid student ID')
      return
    }
    setIsUpdating(true)
    try {
      const formData = new FormData(e.currentTarget)
      const updatedSubjects = Object.fromEntries(
        Array.from(formData.entries()).map(([key, value]) => [key, Number(value)])
      )
      await updateStudentMarks(studentId, selectedClass, selectedYear, selectedTerm, updatedSubjects)
      toast.success('Student marks updated successfully')
      router.push('/dashboard/marks')
    } catch (error) {
      console.error('Error updating student marks:', error)
      toast.error('Failed to update student marks. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Student Marks</CardTitle>
        <CardDescription>Update student marks for the selected class, year, and term</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.name} value={cls.name}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger>
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term} value={term}>{term}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between items-center">
            <div className="w-2/3">
              <Label htmlFor="studentName">Student Name</Label>
              <Input
                id="studentName"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student name"
                disabled
              />
            </div>
            <Button type="button" onClick={fetchStudentMarks} disabled={isLoading}>
              {isLoading ? 'Fetching...' : 'Fetch Marks'}
            </Button>
          </div>
          <Suspense fallback={<div>Loading subjects...</div>}>
            <SubjectInputs 
              selectedClass={selectedClass} 
              classes={classes} 
              subjects={subjects}
            />
          </Suspense>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Student Marks'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}