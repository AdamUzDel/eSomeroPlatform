"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'sonner'
import { Class, Subject } from '@/types'
import { getStudentMarks, updateStudentMarks } from '@/lib/firebaseUtils'

interface EditStudentMarksProps {
  classes: Class[]
  years: string[]
  terms: string[]
  studentId: string
}

export function EditStudentMarks({ classes, years, terms, studentId }: EditStudentMarksProps) {
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.name || '')
  const [selectedYear, setSelectedYear] = useState<string>(years[0] || '')
  const [selectedTerm, setSelectedTerm] = useState<string>(terms[0] || '')
  const [studentName, setStudentName] = useState<string>('')
  const [subjects, setSubjects] = useState<{ [key: string]: number }>({})
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    if (studentId) {
      fetchStudentMarks()
    } else {
      setIsLoading(false)
      toast.error('Invalid student ID')
    }
  }, [studentId, selectedClass, selectedYear, selectedTerm])

  const fetchStudentMarks = async () => {
    setIsLoading(true)
    try {
      const marks = await getStudentMarks(selectedClass, selectedYear, selectedTerm)
      const studentMark = marks.find(mark => mark.id === studentId)
      if (studentMark) {
        setStudentName(studentMark.name)
        setSubjects(studentMark.subjects)
      } else {
        toast.error('Student marks not found')
      }
    } catch (error) {
      console.error('Error fetching student marks:', error)
      toast.error('Failed to fetch student marks. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubjectChange = (subject: string, value: string) => {
    setSubjects(prev => ({
      ...prev,
      [subject]: parseInt(value) || 0
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId) {
      toast.error('Invalid student ID')
      return
    }
    try {
      await updateStudentMarks(studentId, selectedClass, selectedYear, selectedTerm, subjects)
      toast.success('Student marks updated successfully')
      router.push('/dashboard/marks')
    } catch (error) {
      console.error('Error updating student marks:', error)
      toast.error('Failed to update student marks. Please try again.')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
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
          <div>
            <Label htmlFor="studentName">Student Name</Label>
            <Input
              id="studentName"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter student name"
              disabled
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Subject Marks</h3>
            {classes.find(cls => cls.name === selectedClass)?.subjects.map((subject: Subject) => (
              <div key={subject.code} className="flex items-center space-x-2">
                <Label htmlFor={subject.code} className="w-1/3">{subject.name}</Label>
                <Input
                  id={subject.code}
                  type="number"
                  min="0"
                  max="100"
                  value={subjects[subject.code] || ''}
                  onChange={(e) => handleSubjectChange(subject.code, e.target.value)}
                  placeholder="Enter mark"
                  className="w-2/3"
                />
              </div>
            ))}
          </div>
          <Button type="submit">Update Student Marks</Button>
        </form>
      </CardContent>
    </Card>
  )
}