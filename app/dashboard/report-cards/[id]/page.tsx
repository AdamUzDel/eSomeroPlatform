// app/dashboard/report-cards/[id]/page.tsx
"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Head from 'next/head'
import { getStudentById, getStudentMarksForAllTerms } from '@/lib/firebaseUtils'
import { Student, ReportCardMark } from '@/types'
import { Button } from "@/components/ui/button"
import { Printer, User } from 'lucide-react'
import { Oswald } from 'next/font/google'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { QRCodeSVG } from 'qrcode.react'

const oswald = Oswald({ 
  subsets: ['latin'],
  display: 'swap',
})

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
    if (params.id && searchParams.get('year')) {
      setSelectedYear(searchParams.get('year') as string)
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

  const reportCardUrl = `https://esomero.bytebasetech.com/report-cards/${params.id}?year=${selectedYear}`

  const getGrade = (score: number): string => {
    if (score >= 80) return 'A'
    if (score >= 75) return 'A-'
    if (score >= 70) return 'B+'
    if (score >= 65) return 'B'
    if (score >= 60) return 'B-'
    if (score >= 55) return 'C+'
    if (score >= 50) return 'C'
    if (score >= 45) return 'C-'
    if (score >= 40) return 'D+'
    if (score >= 35) return 'D'
    if (score >= 30) return 'D-'
    return 'E'
  }

  const calculateMeanScore = (termsData: ReportCardMark[]): number => {
    const sum = termsData.reduce((acc, term) => acc + term.average, 0)
    return sum / termsData.length
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!student) {
    return <div>Student not found</div>
  }

  const meanScore = calculateMeanScore(termsData)
  const meanGrade = getGrade(meanScore)

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:p-0 print:bg-white">
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <div className="mb-4 print:hidden">
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Report Card
        </Button>
      </div>

      {/* Report card section */}
      <div id="report-card-content" className="bg-white mx-auto w-[210mm] h-[297mm] p-8 shadow-lg print:shadow-none print:w-full print:h-auto relative">
        {/* Watermark */}
        <div 
          className="absolute mx-48 mt-8 inset-0 bg-contain bg-center bg-no-repeat opacity-5 pointer-events-none"
          style={{ backgroundImage: "url('/LoyolaLogoOrig.png')" }}
          aria-hidden="true"
        ></div>

        {/* Header */}
        <div className="text-center relative">
          <div className="flex justify-center items-center mb-2">
            <Image
              src="/LoyolaLogoOrig.png"
              alt="School Logo"
              width={100}
              height={100}
              className="object-contain"
            />
            <div className='ml-4'>
              <h1 className={`${oswald.className} text-2xl font-bold mb-1`}>
                LOYOLA SECONDARY SCHOOL - WAU
              </h1>
              <p className="text-sm">Jebel Kheir, P.O. Box 2 - Wau, South Sudan Email: principal.lss@jesuit.net</p>
              <p className="text-sm">Phone: +211 916363969</p>
              <p className={`${oswald.className} font-semibold mt-2`}>EXAMINATIONS OFFICE</p>
            </div>
          </div>
          
          <div className="border-b-4 border-red-500"></div>
          <p className={`${oswald.className} mt-2 ml-24 font-semibold`}>ACADEMIC PROGRESS REPORT</p>
        </div>

        {/* Student Info */}
        <div className="flex justify-between items-start mb-4 items-center text-sm relative">
          <div className="flex items-start items-center gap-8">
            <div className="flex items-center justify-center">
            <Avatar className="w-20 h-20">
              {student.photo ? (
                <AvatarImage src={student.photo} alt={student.name} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-gray-200">
                <User className="h-10 w-10 text-gray-400" />
              </AvatarFallback>
            </Avatar>
            </div>
            <div>
              <p><span className="font-semibold">NAME:</span> {student.name}</p>
              <p><span className="font-semibold">CLASS:</span> {student.class}</p>
            </div>
          </div>
          <div>
            <p><span className="font-semibold">TERM:</span> {termsData.length > 0 ? termsData[termsData.length - 1].term : 'N/A'}</p>
            <p><span className="font-semibold">YEAR:</span> {selectedYear}</p>
          </div>
          <div className="">
            <QRCodeSVG value={reportCardUrl} size={64} />
          </div>
        </div>

        {/* Marks Table */}
        <table className="w-full border-collapse mb-4 text-sm relative">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-left"></th>
              {termsData.map((termData) => (
                <th key={termData.term} className="border px-2 py-1 text-center" colSpan={2}>
                  {termData.term}<br />OUT OF 100
                </th>
              ))}
            </tr>
            <tr>
                <th className="border px-2 py-1 text-center">SUBJECT</th>
              {termsData.map((termData) => (
                <React.Fragment key={termData.term}>
                  <th className="border px-2 py-1 text-center">TOTAL SCORE</th>
                  <th className="border px-2 py-1 text-center">GRADE</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody className="font-['Times_New_Roman']">
            {Object.entries(termsData[0]?.subjects || {}).map(([subject], index) => (
              <tr key={subject}>
                <td className="border px-2 py-1">{index + 1}. {subject}</td>
                {termsData.map((termData) => (
                  <React.Fragment key={termData.term}>
                    <td className="border px-2 py-1 text-center">
                      {Math.round(termData.subjects[subject])}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {getGrade(termData.subjects[subject])}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="border px-2 py-1 text-center">TOTAL</td>
              {termsData.map((termData) => (
                <td key={termData.term} className="border px-2 py-1 text-center" colSpan={2}>
                  {Math.round(termData.total)}
                </td>
              ))}
            </tr>
            <tr className="font-semibold">
              <td className="border px-2 py-1 text-center">AVERAGE</td>
              {termsData.map((termData) => (
                <React.Fragment key={termData.term}>
                  <td className="border px-2 py-1 text-center">
                    {termData.average.toFixed(1)}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {getGrade(termData.average)}
                  </td>
                </React.Fragment>
              ))}
            </tr>
          </tbody>
        </table>

        {/* Grading Scale */}
        <div className="mb-6 text-xs flex items-center relative">
          <div className="font-semibold mb-2">GRADES</div>
          <table className="w-full border-collapse ml-2 text-center">
            <tbody>
              <tr>
                <td className="border px-2 py-1">A</td>
                <td className="border px-2 py-1">A-</td>
                <td className="border px-2 py-1">B+</td>
                <td className="border px-2 py-1">B</td>
                <td className="border px-2 py-1">B-</td>
                <td className="border px-2 py-1">C+</td>
                <td className="border px-2 py-1">C</td>
                <td className="border px-2 py-1">C-</td>
                <td className="border px-2 py-1">D+</td>
                <td className="border px-2 py-1">D</td>
                <td className="border px-2 py-1">D-</td>
                <td className="border px-2 py-1">E</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">80-100</td>
                <td className="border px-2 py-1">75-79</td>
                <td className="border px-2 py-1">70-74</td>
                <td className="border px-2 py-1">65-69</td>
                <td className="border px-2 py-1">60-64</td>
                <td className="border px-2 py-1">55-59</td>
                <td className="border px-2 py-1">50-54</td>
                <td className="border px-2 py-1">45-49</td>
                <td className="border px-2 py-1">40-44</td>
                <td className="border px-2 py-1">35-39</td>
                <td className="border px-2 py-1">30-34</td>
                <td className="border px-2 py-1">Below 30</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Information */}
        <div className="space-y-4 text-sm relative">
          <div className="grid grid-cols-5 gap-2">
            <p><span className="font-semibold">Mean Score:</span> {meanScore.toFixed(1)}</p>
            <p><span className="font-semibold">Mean Grade:</span> {meanGrade}</p>
            <p><span className="font-semibold">Position:</span> {termsData[termsData.length - 1]?.rank || 'N/A'}</p>
            <p><span className="font-semibold">Promoted to:</span> </p>
            <p><span className="font-semibold">Retained in:</span> <span className="border-b border-gray-300 h-4"></span> </p>
          </div>
          {/* <div className="grid grid-cols-2 gap-4">
            <p><span className="font-semibold">Status:</span> {//termsData[termsData.length - 1]?.status || 'N/A'}</p>
          </div> */}
          <div className="space-y-2">
            <p className="font-semibold">Academic Dean&apos;s Remarks:</p>
            <div className="border-b border-gray-300 h-4"></div>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Principal&apos;s Comments:</p>
            <div className="border-b border-gray-300 h-4"></div>
          </div>
        </div>
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