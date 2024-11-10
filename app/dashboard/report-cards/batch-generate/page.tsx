"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getStudentsByClass, getStudentMarksForAllTerms } from '@/lib/firebaseUtils'
import { Student, ReportCardMark } from '@/types'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { ReportCardTemplate } from '@/components/ReportCardTemplate'
import { createRoot, Root } from 'react-dom/client'
import { AlertCircle, CheckCircle } from 'lucide-react'

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

  const generateReportCard = async (student: Student) => {
    try {
      const marks = await getStudentMarksForAllTerms(student.class, year, student.id)
      
      if (!reportCardRef.current) {
        throw new Error('Report card container not found')
      }

      if (!rootRef.current) {
        rootRef.current = createRoot(reportCardRef.current)
      }

      rootRef.current.render(<ReportCardTemplate student={student} marks={marks} year={year} />)

      // Increase the delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 2000))

      // A4 size in pixels at 150 DPI (reduced from 300 DPI)
      const a4WidthPx = 1240
      const a4HeightPx = 1754

      const canvas = await html2canvas(reportCardRef.current, { 
        scale: 1,
        width: a4WidthPx,
        height: a4HeightPx,
        logging: true,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        onclone: (clonedDoc) => {
          // Force all images to load before rendering
          const images = clonedDoc.getElementsByTagName('img');
          return Promise.all(Array.from(images).filter(img => !img.complete)
            .map(img => new Promise(resolve => { img.onload = img.onerror = resolve; }))
          );
        }
      })

      console.log(`Canvas size: ${canvas.width}x${canvas.height}`)

      const imgData = canvas.toDataURL('image/jpeg', 0.75) // Changed to JPEG with 75% quality

      if (!imgData.startsWith('data:image/jpeg;base64,')) {
        throw new Error('Invalid image data generated')
      }

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