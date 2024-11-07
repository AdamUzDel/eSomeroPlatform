"use client"

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { getStudentById, getStudentMarksForAllTerms } from '@/lib/firebaseUtils'
import { Student, ReportCardMark } from '@/types'
import { Button } from "@/components/ui/button"
import { Printer } from 'lucide-react'
import { Oswald } from 'next/font/google'
import React from 'react'

const oswald = Oswald({ 
  subsets: ['latin'],
  display: 'swap',
})

// Create a cache object
const cache: { [key: string]: { data: any; timestamp: number } } = {}

// Cache expiration time (e.g., 5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000

function getCachedData(key: string) {
  const cachedItem = cache[key]
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_EXPIRATION) {
    return cachedItem.data
  }
  return null
}

function setCachedData(key: string, data: any) {
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

  useEffect(() => {
    if (params.id && searchParams.get('year')) {
      setSelectedYear(searchParams.get('year') as string)
      fetchStudentData()
    }
  }, [params.id, selectedYear])

  const fetchStudentData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('Fetching student data...')
      const cacheKey = `student_${params.id}_${selectedYear}`
      let studentData = getCachedData(cacheKey)

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
  }

  const handlePrint = () => {
    window.print()
  }

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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mb-4 print:hidden">
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Report Card
        </Button>
      </div>

      <div className="bg-white mx-auto w-[210mm] h-[297mm] p-8 shadow-lg print:shadow-none">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-4">
            <Image
              src="/LoyolaLogoOrig.png"
              alt="School Logo"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>
          <h1 className={`${oswald.className} text-2xl font-bold mb-1`}>
            LOYOLA SECONDARY SCHOOL - WAU
          </h1>
          <p className="text-sm">Jebel Kchir, P.O. Box 2 - Wau, South Sudan Email: principal.lss@gmail.com</p>
          <p className="text-sm">Phone: +211 916363969</p>
          <div className="mt-2 border-b-2 border-red-500">
            <p className={`${oswald.className} font-semibold`}>EXAMINATIONS OFFICE</p>
          </div>
          <p className={`${oswald.className} mt-2 font-semibold`}>ACADEMIC PROGRESS REPORT</p>
        </div>

        {/* Student Info */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gray-200 flex items-center justify-center">
              {student.photo ? (
                <Image
                  src={student.photo}
                  alt="Student"
                  width={80}
                  height={80}
                  className="object-cover"
                />
              ) : (
                <span>Photo</span>
              )}
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
        </div>

        {/* Marks Table */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-left">SUBJECT</th>
              {termsData.map((termData) => (
                <th key={termData.term} className="border px-2 py-1 text-center" colSpan={2}>
                  {termData.term}<br />OUT OF 100
                </th>
              ))}
            </tr>
            <tr>
              <th className="border px-2 py-1"></th>
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
              <td className="border px-2 py-1">TOTAL</td>
              {termsData.map((termData) => (
                <td key={termData.term} className="border px-2 py-1 text-center" colSpan={2}>
                  {Math.round(termData.total)}
                </td>
              ))}
            </tr>
            <tr className="font-semibold">
              <td className="border px-2 py-1">AVERAGE</td>
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
        <div className="mb-6 text-sm">
          <div className="font-semibold mb-2">GRADES</div>
          <table className="w-full border-collapse text-center">
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
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-3 gap-4">
            <p><span className="font-semibold">Mean Score:</span> {meanScore.toFixed(1)}</p>
            <p><span className="font-semibold">Mean Grade:</span> {meanGrade}</p>
            <p><span className="font-semibold">Position:</span> {termsData[termsData.length - 1]?.rank || 'N/A'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <p><span className="font-semibold">Status:</span> {termsData[termsData.length - 1]?.status || 'N/A'}</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Academic Dean&apos;s Remarks:</p>
            <div className="border-b border-gray-300 h-8"></div>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Principal&apos;s Comments:</p>
            <div className="border-b border-gray-300 h-8"></div>
          </div>
        </div>
      </div>
    </div>
  )
}