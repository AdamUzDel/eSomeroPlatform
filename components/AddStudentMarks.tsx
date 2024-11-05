"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'sonner'
import { Class, Subject } from '@/types'
import { addStudentMarks } from '@/lib/firebaseUtils'

interface AddStudentMarksProps {
  classes: Class[]
  years: string[]
  terms: string[]
}

export function AddStudentMarks({ classes, years, terms }: AddStudentMarksProps) {
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.name || '')
  const [selectedYear, setSelectedYear] = useState<string>(years[0] || '')
  const [selectedTerm, setSelectedTerm] = useState<string>(terms[0] || '')
  const [studentName, setStudentName] = useState<string>('')
  const [subjects, setSubjects] = useState<{ [key: string]: number }>({})
  const router = useRouter()

  const handleSubjectChange = (subject: string, value: string) => {
    setSubjects(prev => ({
      ...prev,
      [subject]: parseInt(value) || 0
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addStudentMarks(studentName, selectedClass, selectedYear, selectedTerm, subjects)
      toast.success('Student marks added successfully')
      router.push('/dashboard/marks')
    } catch (error) {
      console.error('Error adding student marks:', error)
      toast.error('Failed to add student marks. Please try again.')
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Student Marks</CardTitle>
        <CardDescription>Enter student marks for the selected class, year, and term</CardDescription>
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
          <Button type="submit">Add Student Marks</Button>
        </form>
      </CardContent>
    </Card>
  )
}