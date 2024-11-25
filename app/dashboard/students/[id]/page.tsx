"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import NextImage from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getStudentById, deleteStudent } from '@/lib/firebaseUtils'
import { Student } from '@/types'
import { toast, Toaster } from 'sonner'
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Edit, Trash, User } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function StudentDetails() {
  const router = useRouter()
  const params = useParams()
  const stdId = params?.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (stdId) {
      fetchStudent()
    }
  }, [stdId])

  const fetchStudent = async () => {
    setIsLoading(true)
    try {
      const fetchedStudent = await getStudentById(stdId)
      setStudent(fetchedStudent)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error(`Failed to load student: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(`/dashboard/students/edit/${stdId}`)
  }

  const handleDelete = async () => {
    try {
      await deleteStudent(stdId)
      toast.success('Student deleted successfully')
      router.push('/dashboard/students')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error(`Failed to delete student: ${errorMessage}`)
    }
    setIsDeleteDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Skeleton className="h-12 w-[200px] mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[150px] mb-2" />
            <Skeleton className="h-4 w-[100px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!student) {
    return <div className="container mx-auto py-10 px-4">Student not found</div>
  }

  return (
    <div className="container mx-auto py-4 px-4">
      <Toaster />
      <Button variant="ghost" onClick={() => router.push('/dashboard/students')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Students
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-4">
            {student.photo ? (
              <NextImage 
                src={student.photo} 
                alt={student.name} 
                width={64} 
                height={64} 
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-500" />
              </div>
            )}
            <span>{student.name}</span>
          </CardTitle>
          <CardDescription>Student Details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Class:</strong> {student.class}
          </div>
          <div>
            <strong>Sex:</strong> {student.sex}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" /> Edit Student
          </Button>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="mr-2 h-4 w-4" /> Delete Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to delete this student?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the student&apos;s record and all associated data.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  )
}