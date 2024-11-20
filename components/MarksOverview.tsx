"use client"

import { useState, useCallback, useMemo, useEffect } from 'react'
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

// Define a type for the cache item
type CacheItem = {
  data: StudentMark[];
  timestamp: number;
}

// Create a cache object
const cache: { [key: string]: CacheItem } = {}

// Cache expiration time (e.g., 5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000

function getCachedData(key: string): StudentMark[] | null {
  const cachedItem = cache[key]
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_EXPIRATION) {
    return cachedItem.data
  }
  return null
}

function setCachedData(key: string, data: StudentMark[]): void {
  cache[key] = { data, timestamp: Date.now() }
}

export function MarksOverview({ classes, years, terms }: MarksOverviewProps) {
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.name || '')
  const [selectedYear, setSelectedYear] = useState<string>(years[0] || '')
  const [selectedTerm, setSelectedTerm] = useState<string>(terms[0] || '')
  const [marks, setMarks] = useState<StudentMark[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchMarks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const cacheKey = `marks_${selectedClass}_${selectedYear}_${selectedTerm}`
      let cachedMarks = getCachedData(cacheKey)

      if (!cachedMarks) {
        console.log('Data not in cache, fetching from database...')
        cachedMarks = await getStudentMarks(selectedClass, selectedYear, selectedTerm)
        setCachedData(cacheKey, cachedMarks)
      } else {
        console.log('Data found in cache')
      }

      setMarks(cachedMarks)

      if (cachedMarks.length === 0) {
        console.log(`No data found for the selected filters`)
        setError(`No data found for the selected filters`)
      }
    } catch (error) {
      console.error('Error fetching marks:', error)
      setError('Failed to fetch marks. Please try again.')
      toast.error('Failed to fetch marks. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedClass, selectedYear, selectedTerm])

  useEffect(() => {
    fetchMarks()
  }, [fetchMarks])

  const subjects = useMemo(() => {
    return marks && marks.length > 0 ? Object.keys(marks[0].subjects) : []
  }, [marks])

  const getAverageMarksBySubject = useCallback((): AverageMarkBySubject[] => {
    if (!marks) return []
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
  }, [marks])

  const averageMarksBySubject = useMemo(() => getAverageMarksBySubject(), [getAverageMarksBySubject])

  const handleClassChange = useCallback((value: string) => {
    setSelectedClass(value)
  }, [])

  const handleYearChange = useCallback((value: string) => {
    setSelectedYear(value)
  }, [])

  const handleTermChange = useCallback((value: string) => {
    setSelectedTerm(value)
  }, [])

  const navigateToAddMarks = useCallback(() => {
    router.push('/dashboard/marks/add')
  }, [router])

  const navigateToEditMarks = useCallback((studentId: string, studentName: string) => {
    const queryParams = new URLSearchParams({
      class: selectedClass,
      year: selectedYear,
      term: selectedTerm,
      studentName: studentName
    }).toString()
    
    router.push(`/dashboard/marks/edit/${studentId}?${queryParams}`)
  }, [router, selectedClass, selectedYear, selectedTerm])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold ">Marks Overview</h1>
            <CardTitle className='hidden'>
              Marks Overview
            </CardTitle>
            <CardDescription>View and analyze student marks</CardDescription>
          </div>
          <Button onClick={navigateToAddMarks}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Marks
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedClass} onValueChange={handleClassChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.name} value={cls.name}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTerm} onValueChange={handleTermChange}>
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
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
            </div>
          ) : marks && marks.length > 0 ? (
            <>
              <div className="overflow-x-auto" style={{ maxHeight: '400px' }}>
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marks.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.rank ?? 'N/A'}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        {subjects.map((subject) => (
                          <TableCell key={subject}>{student.subjects[subject] != null ? Math.round(student.subjects[subject]) : 'N/A'}</TableCell>
                        ))}
                        <TableCell>{student.total != null ? Math.round(student.total) : 'N/A'}</TableCell>
                        <TableCell>{student.average?.toFixed(2) ?? 'N/A'}</TableCell>
                        <TableCell>{student.status ?? 'N/A'}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => navigateToEditMarks(student.id, student.name)}>
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
                    <BarChart data={averageMarksBySubject}>
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