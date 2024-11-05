// app/report-card[id]page.tsx
/* "use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStudents, getMarks } from '@/lib/firebaseUtils'
import { Student, Mark, classes, YearData, terms } from '@/types'
import jsPDF from "jspdf"
import "jspdf-autotable"
import { useParams, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import React from 'react' */

export default function ReportCardPage() {
  return(
    <h1>Student Report card here</h1>
  )
}

/* function getGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
} */