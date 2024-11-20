import React, { useMemo } from 'react'
import Image from 'next/image'
import { Student, ReportCardMark, classes } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from 'lucide-react'
import { Oswald } from 'next/font/google'
import { QRCodeSVG } from 'qrcode.react'

const oswald = Oswald({ 
  subsets: ['latin'],
  display: 'swap',
})

interface ReportCardTemplateProps {
  student: Student
  marks: ReportCardMark[]
  year: string
  studentRank: number | null
  totalStudents: number
  promotionStatus: { promoted: boolean; nextClass: string | null }
}

export function ReportCardTemplate({ student, marks, year, studentRank, totalStudents, promotionStatus }: ReportCardTemplateProps) {
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

  const calculateMeanScore = (marks: ReportCardMark[]): number => {
    const sum = marks.reduce((acc, term) => acc + term.average, 0)
    return sum / marks.length
  }

  const getSubjectsForClass = (className: string): { name: string; code: string }[] => {
    const classData = classes.find(c => c.name === className)
    return classData ? classData.subjects : []
  }

  const sortedSubjects = useMemo(() => {
    const classSubjects = getSubjectsForClass(student.class)
    return classSubjects.sort((a, b) => a.name.localeCompare(b.name))
  }, [student.class])

  const meanScore = calculateMeanScore(marks)
  const meanGrade = getGrade(meanScore)

  const reportCardUrl = `https://esomero.bytebasetech.com/report-cards/${student.id}?year=${year}`

  return (
    <div className="bg-white w-[210mm] h-[297mm] p-8 relative overflow-hidden text-black">
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
            <p className="text-sm mb-0">Jebel Kheir, P.O. Box 2 - Wau, South Sudan Email: principal.lss@jesuit.net</p>
            <p className="text-sm my-0">Phone: +211 916363969</p>
            <p className={`${oswald.className} my-0 font-semibold mt-2`}>EXAMINATIONS OFFICE</p>
          </div>
        </div>
        
        <div className="border-b-4 border-red-500"></div>
        <p className={`${oswald.className} mt-2 ml-24 font-semibold`}>ACADEMIC PROGRESS REPORT</p>
      </div>

      {/* Student Info */}
      <div className="flex justify-between items-start mb-4 items-center text-sm relative">
        <div className="flex items-start items-center gap-4">
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
            <p className='my-0'><span className="font-semibold">NAME:</span> {student.name}</p>
            <p className='my-0'><span className="font-semibold">CLASS:</span> {student.class}</p>
          </div>
        </div>
        <div>
          <p className='my-0'><span className="font-semibold">TERM:</span> {marks.length > 0 ? marks[marks.length - 1].term : 'N/A'}</p>
          <p className='my-0'><span className="font-semibold">YEAR:</span> {year}</p>
        </div>
        <div className="">
          <QRCodeSVG value={reportCardUrl} size={64} />
        </div>
      </div>

      {/* Marks Table */}
      <table className="w-full border-collapse mb-4 text-[14px]">
        <thead>
          <tr>
            <th className="border px-1 py-1 text-left"></th>
            {marks.map((termData) => (
              <th key={termData.term} className="border px-1 py-1 text-center" colSpan={2}>
                {termData.term}<br />OUT OF 100
              </th>
            ))}
          </tr>
          <tr>
            <th className="border px-1 py-1 text-center">SUBJECT</th>
            {marks.map((termData) => (
              <React.Fragment key={termData.term}>
                <th className="border px-1 py-1 text-center">TOTAL SCORE</th>
                <th className="border px-1 py-1 text-center">GRADE</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody className="font-['Times_New_Roman']">
          {sortedSubjects.map((subject, index) => (
            <tr key={subject.code}>
              <td className="border px-1 py-1">{index + 1}. {subject.name}</td>
              {marks.map((termData) => (
                <React.Fragment key={termData.term}>
                  <td className="border px-1 py-1 text-center">
                    {termData.subjects[subject.code] != null ? Math.round(termData.subjects[subject.code]) : '-'}
                  </td>
                  <td className="border px-1 py-1 text-center">
                    {termData.subjects[subject.code] != null ? getGrade(termData.subjects[subject.code]) : ''}
                  </td>
                </React.Fragment>
              ))}
            </tr>
          ))}
          <tr className="font-semibold">
            <td className="border px-1 py-1 text-center">TOTAL</td>
            {marks.map((termData) => (
              <td key={termData.term} className="border px-1 py-1 text-center" colSpan={2}>
                {Math.round(termData.total)}
              </td>
            ))}
          </tr>
          <tr className="font-semibold">
            <td className="border px-1 py-1 text-center">AVERAGE</td>
            {marks.map((termData) => (
              <React.Fragment key={termData.term}>
                <td className="border px-1 py-1 text-center">
                  {termData.average.toFixed(1)}
                </td>
                <td className="border px-1 py-1 text-center">
                  {getGrade(termData.average)}
                </td>
              </React.Fragment>
            ))}
          </tr>
        </tbody>
      </table>

      {/* Grading Scale */}
      <div className="mb-4 text-[12px] flex items-center">
        <div className="font-semibold mr-2">GRADES</div>
        <table className="w-full border-collapse text-center">
          <tbody>
            <tr>
              <td className="border px-1 py-1">A</td>
              <td className="border px-1 py-1">A-</td>
              <td className="border px-1 py-1">B+</td>
              <td className="border px-1 py-1">B</td>
              <td className="border px-1 py-1">B-</td>
              <td className="border px-1 py-1">C+</td>
              <td className="border px-1 py-1">C</td>
              <td className="border px-1 py-1">C-</td>
              <td className="border px-1 py-1">D+</td>
              <td className="border px-1 py-1">D</td>
              <td className="border px-1 py-1">D-</td>
              <td className="border px-1 py-1">E</td>
            </tr>
            <tr>
              <td className="border px-1 py-1">80-100</td>
              <td className="border px-1 py-1">75-79</td>
              <td className="border px-1 py-1">70-74</td>
              <td className="border px-1 py-1">65-69</td>
              <td className="border px-1 py-1">60-64</td>
              <td className="border px-1 py-1">55-59</td>
              <td className="border px-1 py-1">50-54</td>
              <td className="border px-1 py-1">45-49</td>
              <td className="border px-1 py-1">40-44</td>
              <td className="border px-1 py-1">35-39</td>
              <td className="border px-1 py-1">30-34</td>
              <td className="border px-1 py-1">Below 30</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Information */}
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-4 gap-2">
          <p><span className="font-semibold">Mean Score:</span> {meanScore.toFixed(1)}</p>
          <p><span className="font-semibold">Mean Grade:</span> {meanGrade}</p>
          <p><span className="font-semibold">Position:</span> {studentRank !== null ? `${studentRank} out of ${totalStudents}` : 'N/A'}</p>
          {promotionStatus.promoted ? (
            <p><span className="font-semibold">Promoted to:</span> {promotionStatus.nextClass}</p>
          ) : (
            <p><span className="font-semibold">Retained in:</span> {student.class}</p>
          )}
          <p></p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold mt-4">Academic Dean&apos;s Remarks:</p>
          <div className="border-b border-gray-300 h-4"></div>
        </div>
        <div className="space-y-1">
          <p className="font-semibold mt-4">Principal&apos;s Comments:</p>
          <div className="border-b border-gray-300 h-4"></div>
        </div>
      </div>
    </div>
  )
}