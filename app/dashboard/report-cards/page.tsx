"use client"

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { getStudentsByClass } from '@/lib/firebaseUtils'
import { toast } from 'sonner'
import { classes, Student, years } from '@/types'
import { Search } from 'lucide-react'

export default function ReportCardsList() {
  const [selectedClass, setSelectedClass] = useState<string>(classes[0].name)
  const [selectedYear, setSelectedYear] = useState<string>(years[0])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    if (selectedClass) {
      fetchStudents()
    }
  }, [selectedClass])

  const fetchStudents = async () => {
    setIsLoading(true)
    try {
      const fetchedStudents = await getStudentsByClass(selectedClass)
      setStudents(fetchedStudents)
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Failed to fetch students. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStudentClick = (studentId: string) => {
    router.push(`/dashboard/report-cards/${studentId}?year=${selectedYear}`)
  }

  const filteredStudents = useMemo(() => {
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [students, searchTerm])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Student Report Cards</CardTitle>
        <CardDescription>Select a class and year to view student report cards</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.name} value={cls.name}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {students.length > 0 && (
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : filteredStudents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Sex</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student, index) => (
                  <TableRow 
                    key={student.id} 
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleStudentClick(student.id)}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.id}</TableCell>
                    <TableCell>{student.sex}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">
                {students.length > 0
                  ? 'No students found matching your search.'
                  : 'No students found in this class.'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}