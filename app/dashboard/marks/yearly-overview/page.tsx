'use client'

import { useState, useMemo } from 'react'
import { YearlyOverview } from '@/components/YearlyOverview'
import { classes, years } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const classCategories = ['PREP', 'S1', 'S2', 'S3', 'S4'];

export default function YearlyOverviewPage() {
  const currentYear = new Date().getFullYear().toString()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedCategory, setSelectedCategory] = useState(classCategories[0])

  const categoryClasses = useMemo(() => {
    return classes.filter(cls => cls.name.startsWith(selectedCategory)).map(cls => cls.name);
  }, [selectedCategory]);

  return (
    <div className="container mx-0 md:mx-auto">
      <h1 className="text-3xl font-bold mb-6">Yearly Overview</h1>
      <Card>
        <CardHeader>
          <CardTitle>Student Performance Overview</CardTitle>
          <CardDescription>View and analyze student performance for the selected year and class category.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select class category" />
              </SelectTrigger>
              <SelectContent>
                {classCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <YearlyOverview 
            key={`${selectedYear}-${selectedCategory}`} 
            year={selectedYear} 
            classes={categoryClasses}
            categoryName={selectedCategory}
          />
        </CardContent>
      </Card>
    </div>
  )
}