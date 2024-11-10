import React from 'react'
import { Student, ReportCardMark } from '@/types'
import localFont from 'next/font/local'

const oswald = localFont({ src: '../public/fonts/Oswald-Regular.ttf' })

interface ReportCardTemplateProps {
  student: Student
  marks: ReportCardMark[]
  year: string
}

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

export function ReportCardTemplate({ student, marks, year }: ReportCardTemplateProps) {
  if (!student || !marks || marks.length === 0) {
    return <div>No data available for this report card.</div>
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

  const calculateMeanScore = (marks: ReportCardMark[]): number => {
    const sum = marks.reduce((acc, term) => acc + term.average, 0)
    return sum / marks.length
  }

  const meanScore = calculateMeanScore(marks)
  const meanGrade = getGrade(meanScore)

  return (
    <div className={`${oswald.className} bg-white w-full h-full p-8 relative`}>
      {/* Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <img src="/LoyolaLogoOrig.png" alt="" className="w-full h-full object-contain" />
      </div>

      {/* Header */}
      <div className="text-center relative">
        <div className="flex justify-center items-center mb-4">
          <img
            src="/LoyolaLogoOrig.png"
            alt="School Logo"
            width={100}
            height={100}
            className="object-contain"
          />
          <div className='ml-4'>
            <h1 className="text-2xl font-bold mb-1">
              LOYOLA SECONDARY SCHOOL - WAU
            </h1>
            <p className="text-sm">Jebel Kheir, P.O. Box 2 - Wau, South Sudan Email: principal.lss@gmail.com</p>
            <p className="text-sm">Phone: +211 916363969</p>
            <p className="font-semibold mt-2">EXAMINATIONS OFFICE</p>
          </div>
        </div>
        
        <div className="border-b-4 border-red-500"></div>
        <p className="mt-2 ml-24 font-semibold">ACADEMIC PROGRESS REPORT</p>
      </div>

      {/* Student Info */}
      <div className="flex justify-between items-start mb-4 items-center text-sm relative pr-4">
        <div className="flex items-start items-center gap-8">
          <div className="w-20 h-20 rounded-full overflow-hidden">
            {student.photo ? (
              <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <UserIcon />
              </div>
            )}
          </div>
          <div>
            <p><span className="font-semibold">NAME:</span> {student.name}</p>
            <p><span className="font-semibold">CLASS:</span> {student.class}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <p><span className="font-semibold">TERM:</span> {marks.length > 0 ? marks[marks.length - 1].term : 'N/A'}</p>
          <p><span className="font-semibold">YEAR:</span> {year}</p>
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
          <p><span className="font-semibold">Mean Score:</span> {meanScore.toFixed(1)}</p>
          <p><span className="font-semibold">Mean Grade:</span> {meanGrade}</p>
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
}