"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import ReactDOM from 'react-dom/client'
import ReactDOMServer from 'react-dom/server'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getStudentsByClass, getStudentMarksForAllTerms } from '@/lib/firebaseUtils'
import { Student } from '@/types'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { ReportCardTemplate } from '@/components/ReportCardTemplate'
import { CheckCircle, XCircle } from 'lucide-react'

type GenerationResult = {
  success: boolean;
  studentName: string;
  error?: string;
}

export default function BatchGenerateReportCards() {
  const searchParams = useSearchParams()
  const [students, setStudents] = useState<Student[]>([])
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null)
  const [progress, setProgress] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generationResults, setGenerationResults] = useState<GenerationResult[]>([])
  const [showSummary, setShowSummary] = useState(false)

  const className = searchParams.get('class') || ''
  const year = searchParams.get('year') || ''

  const fetchStudents = useCallback(async () => {
    try {
      const fetchedStudents = await getStudentsByClass(className)
      setStudents(fetchedStudents)
    } catch (error) {
      console.error('Error fetching students:', error)
      setError('Failed to fetch students. Please try again.')
    }
  }, [className])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const generateReportCard = async (student: Student) => {
    try {
      const marks = await getStudentMarksForAllTerms(student.class, year, student.id)
      console.log(`Fetched marks for ${student.name}:`, marks)

      const reportCardElement = document.createElement('div')
      reportCardElement.style.width = '210mm'
      reportCardElement.style.height = '297mm'
      document.body.appendChild(reportCardElement)

      const root = ReactDOM.createRoot(reportCardElement)
      root.render(<ReportCardTemplate student={student} marks={marks} year={year} />)

      // Wait for React to finish rendering
      await new Promise(resolve => setTimeout(resolve, 1000))

      try {
        console.log('Attempting to capture HTML content...')
        const canvas = await html2canvas(reportCardElement, { 
          scale: 2,
          logging: true,
          width: 210 * 3.7795275591, // Convert mm to px (1mm = 3.7795275591px)
          height: 297 * 3.7795275591,
          onclone: (clonedDoc) => {
            console.log('Cloned document:', clonedDoc.body.innerHTML)
          }
        })

        console.log('HTML content captured. Canvas dimensions:', canvas.width, 'x', canvas.height)

        const imgData = canvas.toDataURL('image/png')
        console.log('Image data generated:', imgData.substring(0, 100) + '...')

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        })
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297)

        pdf.save(`${student.name}_report_card_${year}.pdf`)
      } catch (html2canvasError) {
        console.error('HTML2Canvas failed, falling back to direct HTML rendering:', html2canvasError)

        // Fallback method: Render React component to string and use jsPDF directly
        const htmlString = ReactDOMServer.renderToString(
          <ReportCardTemplate student={student} marks={marks} year={year} />
        )

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        })
        pdf.html(htmlString, {
          callback: function (pdf) {
            pdf.save(`${student.name}_report_card_${year}.pdf`)
          },
          x: 0,
          y: 0,
          width: 210,
          windowWidth: 794 // A4 width in pixels at 96 DPI
        })
      }

      root.unmount()
      document.body.removeChild(reportCardElement)
      return { success: true, studentName: student.name }
    } catch (error) {
      console.error(`Error generating report card for ${student.name}:`, error)
      return { success: false, studentName: student.name, error: (error as Error).message }
    }
  }

  const handleGenerateAll = async () => {
    setIsGenerating(true)
    setProgress(0)
    setError(null)
    setGenerationResults([])
    setShowSummary(false)

    const results: GenerationResult[] = []

    for (let i = 0; i < students.length; i++) {
      setCurrentStudent(students[i])
      const result = await generateReportCard(students[i])
      results.push(result)
      setProgress(((i + 1) / students.length) * 100)
    }

    setGenerationResults(results)
    setIsGenerating(false)
    setCurrentStudent(null)
    setShowSummary(true)
  }

  const successCount = generationResults.filter(result => result.success).length
  const errorCount = generationResults.filter(result => !result.success).length

  return (
    <div className="container mx-auto py-4 px-2 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Generate Class Report Cards</h1>
      <div className="mb-4">
        <p>Class: {className}</p>
        <p>Year: {year}</p>
        <p>Total Students: {students.length}</p>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
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
      {showSummary && (
        <div className="mt-8">
          <Alert>
            <AlertTitle>Generation Summary</AlertTitle>
            <AlertDescription>
              <p>Total report cards generated: {students.length}</p>
              <p>Successful generations: {successCount}</p>
              <p>Failed generations: {errorCount}</p>
            </AlertDescription>
          </Alert>
          <div className="mt-4 space-y-2">
            {generationResults.map((result, index) => (
              <div key={index} className="flex items-center">
                {result.success ? (
                  <CheckCircle className="text-green-500 mr-2" />
                ) : (
                  <XCircle className="text-red-500 mr-2" />
                )}
                <span>{result.studentName}</span>
                {!result.success && (
                  <span className="ml-2 text-red-500">- Error: {result.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}