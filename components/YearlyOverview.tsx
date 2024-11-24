import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getYearlyStudentMarks } from '@/lib/firebaseUtils';
import { calculateYearlyAverage, rankStudents } from '@/lib/marksUtils';
import { YearlyStudentMark } from '@/types';

interface YearlyOverviewProps {
  year: string;
  classes: string[];
  categoryName: string;
}

export function YearlyOverview({ year, classes, categoryName }: YearlyOverviewProps) {
  const [yearlyData, setYearlyData] = useState<YearlyStudentMark[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{categoryName} - Yearly Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="yearly">
          <TabsList>
            <TabsTrigger value="yearly">Yearly Average</TabsTrigger>
            <TabsTrigger value="term1">Term 1</TabsTrigger>
            <TabsTrigger value="term2">Term 2</TabsTrigger>
            <TabsTrigger value="term3">Term 3</TabsTrigger>
          </TabsList>
          <TabsContent value="yearly">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
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
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{student.name}</TableCell>
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
          </TabsContent>
          {['Term 1', 'Term 2', 'Term 3'].map((term) => (
            <TabsContent key={term} value={`term${term.split(' ')[1]}`}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Name</TableHead>
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
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.sex}</TableCell>
                          <TableCell>{student.stream}</TableCell>
                          <TableCell>{termData?.average.toFixed(2) || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}