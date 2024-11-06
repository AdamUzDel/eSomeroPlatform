"use client"

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { getStudentById, getStudentMarks } from '@/lib/firebaseUtils'
import { Student, Mark, terms } from '@/types'
import { Button } from "@/components/ui/button"
import { Printer } from 'lucide-react'
import { Oswald } from 'next/font/google'
import React from 'react'

const oswald = Oswald({ 
  subsets: ['latin'],
  display: 'swap',
})

interface TermData {
  term: string;
  marks: Mark;
}

export default function ReportCardPreview() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [student, setStudent] = useState<Student | null>(null)
  const [selectedYear, setSelectedYear] = useState('2024')
  const [termsData, setTermsData] = useState<TermData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id && searchParams.get('year')) {
      setSelectedYear(searchParams.get('year') as string)
      fetchStudentData()
    }
  }, [params.id, selectedYear])

  const fetchStudentData = async () => {
    try {
      const studentData = await getStudentById(params.id as string)
      setStudent(studentData)
      
      const allTermsData: TermData[] = []
      for (const term of terms) {
        const marks = await getStudentMarks(studentData.class, selectedYear, term)
        const studentMark = marks.find(m => m.id === params.id)
        if (studentMark && Object.keys(studentMark.subjects).length > 0) {
          allTermsData.push({
            term,
            marks: studentMark
          })
        }
      }
      setTermsData(allTermsData)
    } catch (error) {
      console.error('Error fetching student data:', error)
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

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!student) {
    return <div>Student not found</div>
  }

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
            {Object.entries(termsData[0]?.marks.subjects || {}).map(([subject], index) => (
              <tr key={subject}>
                <td className="border px-2 py-1">{index + 1}. {subject}</td>
                {termsData.map((termData) => (
                  <React.Fragment key={termData.term}>
                    <td className="border px-2 py-1 text-center">
                      {Math.round(termData.marks.subjects[subject])}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {getGrade(termData.marks.subjects[subject])}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="border px-2 py-1">TOTAL</td>
              {termsData.map((termData) => (
                <td key={termData.term} className="border px-2 py-1 text-center" colSpan={2}>
                  {Math.round(termData.marks.total)}
                </td>
              ))}
            </tr>
            <tr className="font-semibold">
              <td className="border px-2 py-1">AVERAGE</td>
              {termsData.map((termData) => (
                <React.Fragment key={termData.term}>
                  <td className="border px-2 py-1 text-center">
                    {termData.marks.average.toFixed(1)}
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {getGrade(termData.marks.average)}
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
            <p><span className="font-semibold">Mean Score:</span> {termsData[termsData.length - 1]?.marks.average.toFixed(1) || 'N/A'}</p>
            <p><span className="font-semibold">Mean Grade:</span> {termsData[termsData.length - 1]?.marks ? getGrade(termsData[termsData.length - 1].marks.average) : 'N/A'}</p>
            <p><span className="font-semibold">Position:</span></p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <p><span className="font-semibold">Promoted to Senior:</span></p>
            <p><span className="font-semibold">Retained in Senior:</span></p>
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