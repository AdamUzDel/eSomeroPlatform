"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStudents, deleteStudent, addStudent, updateStudent, addMark } from '@/lib/firebaseUtils'
import { Student, Mark, classes, ExcelRowData } from '@/types'
import * as XLSX from 'xlsx'
import { toast, Toaster } from 'sonner'
import { UploadModal } from '@/components/UploadModal'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, UserPlus, Upload, User, FileSpreadsheet } from 'lucide-react'

export default function StudentsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [students, setStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [isUploading, setIsUploading] = useState(false)
  const [selectedClass, setSelectedClass] = useState(searchParams.get('class') || '')
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const fetchStudents = useCallback(async () => {
    if (!selectedClass) return
    setIsLoading(true)
    try {
      const fetchedStudents = await getStudents(selectedClass)
      const sortedStudents = fetchedStudents.sort((a, b) => a.name.localeCompare(b.name))
      setStudents(sortedStudents)
      toast.success(`Loaded ${sortedStudents.length} students`)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error(`Failed to load students: ${errorMessage}`)
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
  }, [selectedClass, searchTerm])

  const updateURL = () => {
    const params = new URLSearchParams()
    if (selectedClass) params.set('class', selectedClass)
    if (searchTerm) params.set('search', searchTerm)
    router.push(`/dashboard/students?${params.toString()}`, { scroll: false })
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent(id)
      setStudents(students.filter(student => student.id !== id))
      toast.success('Student deleted successfully')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error(`Failed to delete student: ${errorMessage}`)
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/dashboard/students/edit/${id}`)
  }

  const handleExcelUpload = async (year: string, term: string, file: File) => {
    setIsUploading(true)
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, {type: 'array'})
      
      let totalProcessed = 0
      
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json<ExcelRowData>(worksheet)
      
      for (const row of json) {
        if (!row.NAME || !row.SEX) {
          console.warn('Skipping row due to missing Name or Sex:', row)
          continue
        }

        const studentData: Omit<Student, 'id'> = {
          name: row.NAME,
          class: selectedClass,
          sex: row.SEX,
          photo: ''
        }

        const existingStudent = students.find(s => s.name === studentData.name && s.class === studentData.class)

        let studentId: string
        if (existingStudent) {
          await updateStudent(existingStudent.id, studentData)
          studentId = existingStudent.id
        } else {
          studentId = await addStudent(studentData)
        }

        const subjects = classes.find(c => c.name === selectedClass)?.subjects || []
        const markData: Mark = {
          subjects: {},
          total: row.TOT,
          average: row.AVE,
          rank: row.RANK,
          status: row.STATUS
        }

        for (const subject of subjects) {
          if (row[subject.code] !== undefined) {
            markData.subjects[subject.code] = row[subject.code] as number
          }
        }

        await addMark(studentId, year, term, markData)

        totalProcessed++
      }

      await fetchStudents()
      toast.success(`Processed ${totalProcessed} student records successfully`)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error(`Failed to upload Excel file: ${errorMessage}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-4 px-2 sm:px-6 lg:px-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-8">Student Data</h1>
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.name} value={cls.name}>{cls.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 mb-6">
        <Button onClick={() => router.push('/dashboard/students/add')} className="flex items-center">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
        <Button  onClick={() => router.push('/dashboard/students/upload')} disabled={isUploading} className="flex items-center">
          <Upload className="mr-2 h-4 w-4" />
          Upload Excel
        </Button>
      </div>
      {!selectedClass ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Please select a class to view students.</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-10">
          <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No students</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new student or uploading an Excel file.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student, index) => (
                <TableRow key={student.id} className="cursor-pointer hover:bg-gray-50" onClick={() => router.push(`/dashboard/students/${student.id}`)}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={student.photo} alt={student.name} className="object-cover" />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <span>{student.name}</span>
                  </TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>{student.sex}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">Actions</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(student.id); }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/report-cards/${student.id}?class=${student.class}`); }}>View Report Card</DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(student.id); }}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleExcelUpload}
      />
    </div>
  )
}