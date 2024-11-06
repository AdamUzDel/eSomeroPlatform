"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { getStudentMarks } from '@/lib/firebaseUtils'
import { toast } from 'sonner'
import { Class, StudentMark } from '@/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit } from 'lucide-react'

interface AverageMarkBySubject {
  subject: string;
  average: number;
}

interface MarksOverviewProps {
  classes: Class[];
  years: string[];
  terms: string[];
}

export function MarksOverview({ classes, years, terms }: MarksOverviewProps) {
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.name || '')
  const [selectedYear, setSelectedYear] = useState<string>(years[0] || '')
  const [selectedTerm, setSelectedTerm] = useState<string>(terms[0] || '')
  const [marks, setMarks] = useState<StudentMark[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    if (selectedClass && selectedYear && selectedTerm) {
      fetchMarks()
    }
  }, [selectedClass, selectedYear, selectedTerm])

  const fetchMarks = async () => {
    setIsLoading(true)
    try {
      const fetchedMarks = await getStudentMarks(selectedClass, selectedYear, selectedTerm)
      setMarks(fetchedMarks)
      if (fetchedMarks.length > 0) {
        setSubjects(Object.keys(fetchedMarks[0].subjects))
      }
    } catch (error) {
      console.error('Error fetching marks:', error)
      toast.error('Failed to fetch marks. Please try again.')
      setMarks([])
      setSubjects([])
    } finally {
      setIsLoading(false)
    }
  }

  const getAverageMarksBySubject = (): AverageMarkBySubject[] => {
    const subjectTotals: { [key: string]: number } = {}
    const subjectCounts: { [key: string]: number } = {}

    marks.forEach(student => {
      if (student.subjects) {
        Object.entries(student.subjects).forEach(([subject, mark]) => {
          if (!subjectTotals[subject]) {
            subjectTotals[subject] = 0
            subjectCounts[subject] = 0
          }
          subjectTotals[subject] += mark
          subjectCounts[subject]++
        })
      }
    })

    return Object.entries(subjectTotals).map(([subject, total]) => ({
      subject,
      average: total / subjectCounts[subject]
    }))
  }

  return (
    <Card className="w-full">
    <CardHeader>
      <div className="flex justify-between items-center">
        <div>
          <CardTitle>Marks Overview</CardTitle>
          <CardDescription>View and analyze student marks</CardDescription>
        </div>
        <Button onClick={() => router.push('/dashboard/marks/add')}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Marks
        </Button>
      </div>
    </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
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
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term} value={term}>{term}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : marks.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Student</TableHead>
                      {subjects.map((subject) => (
                        <TableHead key={subject}>{subject}</TableHead>
                      ))}
                      <TableHead>Total</TableHead>
                      <TableHead>Average</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marks.map((student) => (
                      <TableRow key={student.id} className="cursor-pointer hover:bg-gray-100" /* onClick={() => router.push(`/dashboard/students/${student.id}`)} */>
                      <TableCell>{student.rank ?? 'N/A'}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        {subjects.map((subject) => (
                          <TableCell key={subject}>{student.subjects[subject] != null ? Math.round(student.subjects[subject]) : 'N/A'}</TableCell>
                        ))}
                        <TableCell>{student.total != null ? Math.round(student.total) : 'N/A'}</TableCell>
                        <TableCell>{student.average?.toFixed(2) ?? 'N/A'}</TableCell>
                        <TableCell>{student.status ?? 'N/A'}</TableCell>
                        <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/marks/edit/${student.id}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Average Marks by Subject</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getAverageMarksBySubject()}>
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="average" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No marks data found for the selected filters.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}