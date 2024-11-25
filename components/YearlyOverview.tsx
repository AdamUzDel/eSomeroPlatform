import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getYearlyStudentMarks } from '@/lib/firebaseUtils';
import { calculateYearlyAverage, rankStudents } from '@/lib/marksUtils';
import { YearlyStudentMarks, YearlyStudentMark } from '@/types';
import { PrinterIcon } from 'lucide-react';

interface YearlyOverviewProps {
  year: string;
  classes: string[];
  categoryName: string;
}

export function YearlyOverview({ year, classes, categoryName }: YearlyOverviewProps) {
  const [yearlyData, setYearlyData] = useState<YearlyStudentMark[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('yearly');

  const fetchYearlyData = useCallback(async () => {
    setIsLoading(true);
    try {
      const classPromises = classes.map(className => getYearlyStudentMarks(year, className));
      const classResults = await Promise.all(classPromises);
      const allStudents = classResults.flatMap(result => Object.values(result));
      setYearlyData(allStudents);
    } catch (error) {
      console.error('Error fetching yearly data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [year, classes]);

  useEffect(() => {
    fetchYearlyData();
  }, [fetchYearlyData]);

  const rankedStudents = useMemo(() => {
    return rankStudents(yearlyData);
  }, [yearlyData]);

  const handlePrint = useCallback(() => {
    const printContent = document.getElementById('printable-table');
    const windowPrint = window.open('', '', 'width=900,height=650');
    windowPrint?.document.write(`
      <html>
        <head>
          <title>${categoryName} Overall Results - ${year}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 4px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            @media print {
              body {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 10mm;
              }
              table {
                page-break-inside: auto;
              }
              tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
            }
          </style>
        </head>
        <body>
          <h1>${categoryName} Overall Results - ${year}</h1>
          ${printContent?.innerHTML}
        </body>
      </html>
    `);
    windowPrint?.document.close();
    windowPrint?.focus();
    windowPrint?.print();
    windowPrint?.close();
  }, [categoryName, year]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <h2 className="text-2xl font-bold mb-4 sm:mb-0">{categoryName} - Yearly Overview</h2>
        <Button onClick={handlePrint} className="print:hidden">
          <PrinterIcon className="mr-2 h-4 w-4" /> Print Results
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap justify-start mb-4">
          <TabsTrigger value="yearly">Yearly Average</TabsTrigger>
          <TabsTrigger value="term1">Term 1</TabsTrigger>
          <TabsTrigger value="term2">Term 2</TabsTrigger>
          <TabsTrigger value="term3">Term 3</TabsTrigger>
        </TabsList>
        <TabsContent value="yearly">
          <div id="printable-table" className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background">Rank</TableHead>
                  <TableHead className="sticky left-12 bg-background">Name</TableHead>
                  <TableHead>Sex</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Term 1 Avg</TableHead>
                  <TableHead>Term 2 Avg</TableHead>
                  <TableHead>Term 3 Avg</TableHead>
                  <TableHead>Overall Avg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankedStudents.map((student, index) => {
                  const term1Avg = student.terms['Term 1']?.average || 0;
                  const term2Avg = student.terms['Term 2']?.average || 0;
                  const term3Avg = student.terms['Term 3']?.average || 0;
                  const overallAvg = calculateYearlyAverage(student);

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="sticky left-0 bg-background">{index + 1}</TableCell>
                      <TableCell className="sticky left-12 bg-background">{student.name}</TableCell>
                      <TableCell>{student.sex}</TableCell>
                      <TableCell>{student.stream}</TableCell>
                      <TableCell>{term1Avg.toFixed(2)}</TableCell>
                      <TableCell>{term2Avg.toFixed(2)}</TableCell>
                      <TableCell>{term3Avg.toFixed(2)}</TableCell>
                      <TableCell>{overallAvg.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        {['Term 1', 'Term 2', 'Term 3'].map((term) => (
          <TabsContent key={term} value={`term${term.split(' ')[1]}`}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background">Rank</TableHead>
                    <TableHead className="sticky left-12 bg-background">Name</TableHead>
                    <TableHead>Sex</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Average</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankedStudents
                    .filter(student => student.terms[term])
                    .sort((a, b) => (b.terms[term]?.average || 0) - (a.terms[term]?.average || 0))
                    .map((student, index) => {
                      const termData = student.terms[term];
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="sticky left-0 bg-background">{index + 1}</TableCell>
                          <TableCell className="sticky left-12 bg-background">{student.name}</TableCell>
                          <TableCell>{student.sex}</TableCell>
                          <TableCell>{student.stream}</TableCell>
                          <TableCell>{termData?.average.toFixed(2) || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}