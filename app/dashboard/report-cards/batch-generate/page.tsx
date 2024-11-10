"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { getStudentsByClass, getStudentMarksForAllTerms } from '@/lib/firebaseUtils'
import { Student, ReportCardMark } from '@/types'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, User } from 'lucide-react'
import { Oswald } from 'next/font/google'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { QRCodeSVG } from 'qrcode.react'
import { createRoot, Root } from 'react-dom/client'

const oswald = Oswald({ 
  subsets: ['latin'],
  display: 'swap',
})

export default function BatchGenerateReportCards() {
  const searchParams = useSearchParams()
  const [students, setStudents] = useState<Student[]>([])
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null)
  const [progress, setProgress] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [generatedReports, setGeneratedReports] = useState<string[]>([])
  const reportCardRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<Root | null>(null)

  const className = searchParams.get('class') || ''
  const year = searchParams.get('year') || ''

  const fetchStudents = useCallback(async () => {
    try {
      const fetchedStudents = await getStudentsByClass(className)
      setStudents(fetchedStudents)
    } catch (error) {
      setError('Failed to fetch students. Please try again.')
    }
  }, [className])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

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

  const ReportCardContent: React.FC<{ student: Student; marks: ReportCardMark[]; year: string }> = ({ student, marks, year }) => (
    <div className="bg-white w-[210mm] h-[297mm] p-8 relative">
      {/* Watermark */}
      <div 
        className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-5 pointer-events-none"
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
          <Avatar className="w-20 h-20">
            {student.photo ? (
              <AvatarImage src={student.photo} alt={student.name} className="object-cover" />
            ) : (
              <AvatarFallback className="bg-gray-200">
                <User className="h-10 w-10 text-gray-400" />
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <p><span className="font-semibold">NAME:</span> {student.name}</p>
            <p><span className="font-semibold">CLASS:</span> {student.class}</p>
          </div>
        </div>
        <div>
          <p><span className="font-semibold">TERM:</span> {marks.length > 0 ? marks[marks.length - 1].term : 'N/A'}</p>
          <p><span className="font-semibold">YEAR:</span> {year}</p>
        </div>
        <div>
          <QRCodeSVG value={`https://esomero.bytebasetech.com/report-cards/${student.id}?year=${year}`} size={64} />
        </div>
      </div>

      {/* Marks Table */}
      <table className="w-full border-collapse mb-4 text-sm relative">
        <thead>
          <tr>
            <th className="border px-2 py-1 text-left"></th>
            {marks.map((termData) => (
              <th key={termData.term} className="border px-2 py-1 text-center" colSpan={2}>
                {termData.term}<br />OUT OF 100
              </th>
            ))}
          </tr>
          <tr>
            <th className="border px-2 py-1 text-center">SUBJECT</th>
            {marks.map((termData) => (
              <React.Fragment key={termData.term}>
                <th className="border px-2 py-1 text-center">TOTAL SCORE</th>
                <th className="border px-2 py-1 text-center">GRADE</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody className="font-['Times_New_Roman']">
          {Object.entries(marks[0]?.subjects || {}).map(([subject], index) => (
            <tr key={subject}>
              <td className="border px-2 py-1">{index + 1}. {subject}</td>
              {marks.map((termData) => (
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
            {marks.map((termData) => (
              <td key={termData.term} className="border px-2 py-1 text-center" colSpan={2}>
                {Math.round(termData.total)}
              </td>
            ))}
          </tr>
          <tr className="font-semibold">
            <td className="border px-2 py-1 text-center">AVERAGE</td>
            {marks.map((termData) => (
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
          <p><span className="font-semibold">Mean Score:</span> {calculateMeanScore(marks).toFixed(1)}</p>
          <p><span className="font-semibold">Mean Grade:</span> {getGrade(calculateMeanScore(marks))}</p>
          <p><span className="font-semibold">Position:</span> {marks[marks.length - 1]?.rank || 'N/A'}</p>
          <p><span className="font-semibold">Promoted to:</span> </p>
          <p><span className="font-semibold">Retained in:</span> <span className="border-b border-gray-300 h-4"></span> </p>
        </div>
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
  )

  const generateReportCard = async (student: Student) => {
    try {
      const marks = await getStudentMarksForAllTerms(student.class, year, student.id)
      
      if (!reportCardRef.current) {
        throw new Error('Report card container not found')
      }

      // Create a new root if it doesn't exist
      if (!rootRef.current) {
        rootRef.current = createRoot(reportCardRef.current)
      }

      // Render the report card content
      rootRef.current.render(<ReportCardContent student={student} marks={marks} year={year} />)

      // Wait for images to load
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const canvas = await html2canvas(reportCardRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      })

      const imgData = canvas.toDataURL('image/jpeg', 1.0)

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297)

      const fileName = `${student.name}_report_card_${year}.pdf`
      pdf.save(fileName)

      return fileName
    } catch (error) {
      console.error(`Error generating report card for ${student.name}:`, error)
      throw error
    }
  }

  const handleGenerateAll = async () => {
    setIsGenerating(true)
    setProgress(0)
    setError(null)
    setSuccessMessage(null)
    setGeneratedReports([])

    const generatedFiles: string[] = []

    for (let i = 0; i < students.length; i++) {
      try {
        setCurrentStudent(students[i])
        const fileName = await generateReportCard(students[i])
        generatedFiles.push(fileName)
        setProgress(((i + 1) / students.length) * 100)
      } catch (error) {
        console.error(`Error generating report card for ${students[i].name}:`, error)
        setError(`Failed to generate report card for ${students[i].name}. Please try again.`)
      }
    }

    setIsGenerating(false)
    setCurrentStudent(null)
    setGeneratedReports(generatedFiles)
    setSuccessMessage(`Successfully generated ${generatedFiles.length} report cards.`)

    // Clean up the root after generation is complete
    if (rootRef.current) {
      rootRef.current.unmount()
      rootRef.current = null
    }
  }

  return (
    <div className="container mx-auto py-4 px-2 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Generate Class Report Cards</h1>
      <div className="mb-4">
        <p>Class: {className}</p>
        <p>Year: {year}</p>
        <p>Total Students: {students.length}</p>
      </div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert variant="default" className="mb-4">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      <Button onClick={handleGenerateAll} disabled={isGenerating || students.length === 0}>
        Generate All Report Cards
      </Button>
      {isGenerating && (
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <p className="mt-2">
            Generating report card for: {currentStudent?.name || 'Loading...'}
          </p>
        </div>
      )}
      {generatedReports.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Generated Report Cards:</h2>
          <ul className="list-disc pl-5">
            {generatedReports.map((fileName, index) => (
              <li key={index}>{fileName}</li>
            ))}
          </ul>
        </div>
      )}
      <div ref={reportCardRef} className="hidden"></div>
    </div>
  )
}