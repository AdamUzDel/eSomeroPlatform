"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Head from 'next/head'
import { getStudentById, getStudentMarksForAllTerms, getClassAverageScores  } from '@/lib/firebaseUtils'
import { Student, ReportCardMark, classHierarchy } from '@/types'
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft } from 'lucide-react'
import { ReportCardTemplate } from '@/components/ReportCardTemplate'
import Link from 'next/link'

// Define a type for the cache item
type CacheItem = {
  data: unknown;
  timestamp: number;
}

// Create a cache object
const cache: { [key: string]: CacheItem } = {}

// Cache expiration time (e.g., 5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000

function getCachedData(key: string): unknown {
  const cachedItem = cache[key]
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_EXPIRATION) {
    return cachedItem.data
  }
  return null
}

function setCachedData(key: string, data: unknown): void {
  cache[key] = { data, timestamp: Date.now() }
}

export default function ReportCardPreview() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [student, setStudent] = useState<Student | null>(null)
  const [selectedYear, setSelectedYear] = useState('2024')
  const [termsData, setTermsData] = useState<ReportCardMark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageTitle, setPageTitle] = useState('Report Card')
  const [studentRank, setStudentRank] = useState<number | null>(null)
  const [totalStudents, setTotalStudents] = useState<number>(0)
  const [promotionStatus, setPromotionStatus] = useState<{ promoted: boolean; nextClass: string | null }>({ promoted: false, nextClass: null })

  const fetchStudentData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('Fetching student data...')
      const cacheKey = `student_${params.id}_${selectedYear}`
      let studentData = getCachedData(cacheKey) as { student: Student; marks: ReportCardMark[] } | null

      if (!studentData) {
        console.log('Data not in cache, fetching from database...')
        const fetchedStudent = await getStudentById(params.id as string)
        if (!fetchedStudent) {
          throw new Error('Student not found')
        }
        console.log('Fetched student:', fetchedStudent)

        const fetchedMarks = await getStudentMarksForAllTerms(fetchedStudent.class, selectedYear, params.id as string)
        console.log('Fetched marks:', fetchedMarks)

        studentData = {
          student: fetchedStudent,
          marks: fetchedMarks
        }

        setCachedData(cacheKey, studentData)
      } else {
        console.log('Data found in cache')
      }

      setStudent(studentData.student)
      setTermsData(studentData.marks)
      setPageTitle(`${studentData.student.name} - LSS Report Card`)

      // Fetch class average scores (optimized)
      const classAverages = await getClassAverageScores(studentData.student.class, selectedYear);
      setTotalStudents(classAverages.length);

      // Calculate student's average score
      const studentAverage = studentData.marks.reduce((sum, term) => sum + term.average, 0) / studentData.marks.length;// Determine promotion threshold based on class
      let promotionThreshold = 60 // Default threshold
      if (studentData.student.class.includes('PREP') || studentData.student.class.startsWith('S1')) {
        promotionThreshold = 45
      } else if (studentData.student.class.startsWith('S2')) {
        promotionThreshold = 50
      } else if (studentData.student.class.startsWith('S3')) {
        promotionThreshold = 60
      }

      // Determine promotion status
      const isPromoted = studentAverage >= promotionThreshold
      const nextClass = classHierarchy[studentData.student.class as keyof typeof classHierarchy]
      setPromotionStatus({ promoted: isPromoted, nextClass: isPromoted ? nextClass : null })

      // Calculate student rank
      const rank = classAverages.filter(avg => avg > studentAverage).length + 1;
      setStudentRank(rank);

      if (studentData.marks.length === 0) {
        console.log(`No data found for the year ${selectedYear}`)
        setError(`No data found for the year ${selectedYear}`)
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
      setError('Failed to fetch student data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [params.id, selectedYear])

  useEffect(() => {
    if (params.id) {
      const year = searchParams.get('year')
      if (year) {
        setSelectedYear(year)
      }
      fetchStudentData()
    }
  }, [params.id, searchParams, fetchStudentData])

  useEffect(() => {
    // Update the document title
    document.title = pageTitle
  }, [pageTitle])

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Warning: </strong>
          <span className="block sm:inline">Student not found</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:p-0 print:bg-white">
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <div className="mb-4 print:hidden flex justify-between items-center">
        <Link href="/dashboard/students" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Students
          </Button>
        </Link>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Report Card
        </Button>
      </div>

      {/* Report card section */}
      <div id="report-card-content" className="bg-white mx-auto w-[210mm] h-[297mm] shadow-lg print:shadow-none print:w-full print:h-auto relative">
      <ReportCardTemplate 
          student={student} 
          marks={termsData} 
          year={selectedYear} 
          studentRank={studentRank}
          totalStudents={totalStudents}
          promotionStatus={promotionStatus}
        />
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          #report-card-content, #report-card-content * {
            visibility: visible;
          }
          #report-card-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
          }
        }
      `}</style>
    </div>
  )
}