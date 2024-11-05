// app/report-card/page.tsx
"use client"

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getStudents, deleteStudent, addStudent, updateStudent, addMark } from '@/lib/firebaseUtils'
import { Student, Mark, /* Class, */ classes, ExcelRowData } from '@/types'


export default function ReportCardPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  

  useEffect(() => {
    const fetchStudents = async () => {
      const fetchedStudents = await getStudents()
      setStudents(fetchedStudents)
    }
    fetchStudents()
  }, [])

  const handleGenerateReportCard = () => {
    console.log("Generating report card for:", selectedStudent)
    // Here you would typically generate and download the report card
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Generate Report Card</h1>
      <div className="flex space-x-4 mb-4">
        <Select onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="S2A">S2A</SelectItem>
            <SelectItem value="S2B">S2B</SelectItem>
            <SelectItem value="S2C">S2C</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setSelectedStudent(students.find(s => s.id === parseInt(value)))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Student" />
          </SelectTrigger>
          <SelectContent>
            {students.filter(s => s.class === selectedClass).map(student => (
              <SelectItem key={student.id} value={student.id.toString()}>{student.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleGenerateReportCard}>Generate Report Card</Button>
      </div>
      {selectedStudent && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Term 1</TableHead>
              <TableHead>Term 2</TableHead>
              <TableHead>Term  3</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Average</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(selectedStudent.subjects).map(([subject, marks]) => {
              const total = marks.term1 + marks.term2 + marks.term3
              const average = (total / 3).toFixed(2)
              return (
                <TableRow key={subject}>
                  <TableCell>{subject}</TableCell>
                  <TableCell>{marks.term1}</TableCell>
                  <TableCell>{marks.term2}</TableCell>
                  <TableCell>{marks.term3}</TableCell>
                  <TableCell>{total}</TableCell>
                  <TableCell>{average}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}