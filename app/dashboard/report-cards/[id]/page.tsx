// app/report-card[id]page.tsx
"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStudents, getMarks } from '@/lib/firebaseUtils'
import { Student, /* Mark, */ classes, YearData, terms } from '@/types'
import jsPDF from "jspdf"
import "jspdf-autotable"
import { useParams, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import React from 'react'

export default function ReportCardPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const stdID = params?.id as string;
  const studentClass = searchParams.get('class')
  const [student, setStudent] = useState<Student | null>(null)
  const [marks, setMarks] = useState<YearData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!stdID || !studentClass) {
      setError("No student ID or class provided")
      setIsLoading(false)
      return
    }
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
  
        const students = await getStudents(studentClass);
        const student = students.find(s => s.id === stdID);
        
        if (!student) {
          throw new Error("Student not found");
        }
  
        setStudent(student);
        
        // Fetch marks for the specific year
        const fetchedMarks = await getMarks(student.id);
        console.log("Year data: ", fetchedMarks)
        setMarks(fetchedMarks);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load student data. Please try again.");
        toast.error("Failed to load student data");
      } finally {
        setIsLoading(false);
      }
    }
  
    fetchData();
  }, [stdID, studentClass]);

  const generatePDF = () => {
    if (!student || !marks) return

    const doc = new jsPDF()

    // Add school logo
    doc.addImage("/LoyolaLogoOrig.png", "PNG", 10, 10, 30, 30)

    // Add student information
    doc.setFontSize(18)
    doc.text("Student Report Card", 105, 20, { align: "center" })
    doc.setFontSize(12)
    doc.text(`Name: ${student.name}`, 20, 50)
    doc.text(`Class: ${student.class}`, 20, 60)

    let yOffset = 80

    Object.entries(marks).forEach(([year, termData]) => {
      Object.entries(termData).forEach(([term, markData]) => {
        doc.setFontSize(14)
        doc.text(`${year} - ${term}`, 105, yOffset, { align: "center" })
        yOffset += 10

        const tableColumn = ["Subject", "Score", "Grade"]
        const tableRows = Object.entries(markData.subjects).map(([subjectCode, score]) => {
          const subject = classes.find(c => c.name === student.class)?.subjects.find(s => s.code === subjectCode)
          return [subject?.name || subjectCode, score, getGrade(score)]
        })

        ;(doc as any).autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: yOffset,
        })

        yOffset = (doc as any).lastAutoTable.finalY + 10

        doc.text(`Total Marks: ${markData.total}`, 20, yOffset)
        yOffset += 10
        doc.text(`Average Mark: ${markData.average}`, 20, yOffset)
        yOffset += 10
        doc.text(`Rank:  ${markData.rank}`, 20, yOffset)
        yOffset += 10
        doc.text(`Status: ${markData.status}`, 20, yOffset)
        yOffset += 20

        if (yOffset > 250) {
          doc.addPage()
          yOffset = 20
        }
      })
    })

    // Save the PDF
    doc.save(`${student.name}_report_card.pdf`)
  }

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (error) return <div className="text-red-500 text-center">{error}</div>
  if (!student || !marks) return <div className="text-center">No data available</div>

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Report Card for {student.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Name: {student.name}</p>
          <p>Class: {student.class}</p>
          <p>Sex: {student.sex}</p>
        </CardContent>
      </Card>
      {Object.keys(marks).length === 0 ? (
  <div className="mt-4 text-center">No marks data available for this student.</div>
) : (
  <Card className="mt-4">
    <CardHeader>
      <CardTitle>2024 - Term Marks by Subject</CardTitle>
    </CardHeader>
    <CardContent>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-4">Subject</th>
            <th className="py-2 px-4">Term 1 Score</th>
            <th className="py-2 px-4">Term 1 Grade</th>
            <th className="py-2 px-4">Term 2 Score</th>
            <th className="py-2 px-4">Term 2 Grade</th>
            <th className="py-2 px-4">Term 3 Score</th>
            <th className="py-2 px-4">Term 3 Grade</th>
          </tr>
        </thead>
        {/* <tbody>
          {classes.find(c => c.name === student.class)?.subjects.map(subject => {
            const subjectCode = subject.code;

            return (
              <tr key={subjectCode} className="border-b">
                <td className="py-2 px-4">{subject.name}</td>
                {[1, 2, 3].map(term => {
                  const termKey = `term${term}`;
                  const termData = marks[termKey]?.subjects?.[subjectCode];
                  return (
                    <React.Fragment key={`${subjectCode}-${term}`}>
                      <td className="py-2 px-4">{termData || '-'}</td>
                      <td className="py-2 px-4">{termData ? getGrade(termData) : '-'}</td>
                    </React.Fragment>
                  );
                })}
              </tr>
            );
          })}
        </tbody> */}
        <tbody>
          {classes.find(c => c.name === student.class)?.subjects.map(subject => {
            const subjectCode = subject.code;

            return (
              <tr key={subjectCode} className="border-b">
                <td className="py-2 px-4">{subject.name}</td>
                {terms.map((term, termIndex) => {
                  // Assuming 'year' is a prop or state variable representing the current year
                  const termKey = `term${termIndex + 1}`; // term1, term2, etc.
                  const yearData = marks[2024]; // Get data for the current year
                  const termData = yearData?.[termKey]?.subjects?.[subjectCode];

                  return (
                    <React.Fragment key={`${subjectCode}-${termKey}`}>
                      <td className="py-2 px-4">
                        {termData !== undefined ? termData : '-'}
                      </td>
                      <td className="py-2 px-4">
                        {termData !== undefined ? getGrade(termData) : '-'}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4">
        {[1, 2, 3].map(term => {
          const termKey = `term${term}`;
          const termData = marks[termKey];
          return (
            <div key={termKey} className="mt-2">
              <h4 className="text-lg font-semibold">2024 - Term {term}</h4>
              <p><strong>Total Marks:</strong> {termData?.total || '-'}</p>
              <p><strong>Average Mark:</strong> {termData?.average || '-'}</p>
              <p><strong>Rank:</strong> {termData?.rank || '-'}</p>
              <p><strong>Status:</strong> {termData?.status || '-'}</p>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
)}
      <Button onClick={generatePDF} className="mt-4">Generate PDF</Button>
    </div>
  )
}

function getGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}