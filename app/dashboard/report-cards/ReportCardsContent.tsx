'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { getStudentsByClass } from '@/lib/firebaseUtils'
import { toast } from 'sonner'
import { classes, Student, years } from '@/types'
import { Search } from 'lucide-react'

export default function ReportCardsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedClass, setSelectedClass] = useState<string>(searchParams.get('class') || '')
  const [selectedYear, setSelectedYear] = useState<string>(searchParams.get('year') || years[0])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '')

  const fetchStudents = useCallback(async () => {
    if (!selectedClass) return
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
  }, [selectedClass])

  useEffect(() => {
    if (selectedClass) {
      fetchStudents()
    }
  }, [selectedClass, fetchStudents])

  useEffect(() => {
    updateURL()
  }, [selectedClass, selectedYear, searchTerm])

  const updateURL = () => {
    const params = new URLSearchParams()
    if (selectedClass) params.set('class', selectedClass)
    if (selectedYear !== years[0]) params.set('year', selectedYear)
    if (searchTerm) params.set('search', searchTerm)
    router.push(`/dashboard/report-cards?${params.toString()}`, { scroll: false })
  }

  const handleStudentClick = (studentId: string) => {
    router.push(`/dashboard/report-cards/${studentId}?year=${selectedYear}`)
  }

  const handleClassChange = (value: string) => {
    setSelectedClass(value)
    setStudents([])
    setSearchTerm('')
  }

  const handleYearChange = (value: string) => {
    setSelectedYear(value)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredStudents = useMemo(() => {
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [students, searchTerm])

  return (
    <CardContent>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedClass} onValueChange={handleClassChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.name} value={cls.name}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>
        </div>

        {!selectedClass ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Please select a class to view students.</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
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
  )
}