// app/add-marks/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getStudents, addMark } from '@/lib/firebaseUtils'
import { Student, /* Mark, */ classes } from '@/types'

export default function AddMarksPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [marks, setMarks] = useState<{[key: string]: {[key: string]: number}}>({})

  useEffect(() => {
    const fetchStudents = async () => {
      const fetchedStudents = await getStudents()
      setStudents(fetchedStudents)
    }
    fetchStudents()
  }, [])

  const handleMarkChange = (studentId: string, subject: string, value: string) => {
    setMarks(prevMarks => ({
      ...prevMarks,
      [studentId]: {
        ...prevMarks[studentId],
        [subject]: parseInt(value) || 0
      }
    }))
  }

  const handleSubmit = async () => {
    for (const [studentId, studentMarks] of Object.entries(marks)) {
      for (const [subject, mark] of Object.entries(studentMarks)) {
        await addMark({
          studentId,
          subject,
          [`term${selectedTerm}`]: mark,
          term1: null,
          term2: null,
          term3: null,
        })
      }
    }
    alert('Marks submitted successfully')
  }

  return (
    <div className="container mx-auto py-10">
      
      <h1 className="text-2xl font-bold mb-5">Add Student Marks</h1>
      <div className="flex space-x-4 mb-4">
        <Select onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.name} value={cls.name}>{cls.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={setSelectedTerm}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Term" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Term 1</SelectItem>
            <SelectItem value="2">Term 2</SelectItem>
            <SelectItem value="3">Term 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            {selectedClass && classes.find(cls => cls.name === selectedClass)?.subjects.map(subject => (
              <TableHead key={subject.code}>{subject.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.filter(student => student.class === selectedClass).map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.name}</TableCell>
              {selectedClass && classes.find(cls => cls.name === selectedClass)?.subjects.map(subject => (
                <TableCell key={subject.code}>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    onChange={(e) => handleMarkChange(student.id, subject.code, e.target.value)}
                    value={marks[student.id]?.[subject.code] || ''}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={handleSubmit} className="mt-4">Submit Marks</Button>
    </div>
  )
}