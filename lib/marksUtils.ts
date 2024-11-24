import { YearlyStudentMark } from '@/types';

export function calculateYearlyAverage(yearlyMark: YearlyStudentMark): number {
  const termAverages = Object.values(yearlyMark.terms).map(term => term.average);
  if (termAverages.length === 0) return 0;
  return termAverages.reduce((sum, avg) => sum + avg, 0) / termAverages.length;
}

export function rankStudents(students: YearlyStudentMark[]): YearlyStudentMark[] {
  return students
    .sort((a, b) => calculateYearlyAverage(b) - calculateYearlyAverage(a))
    .map((student, index) => ({ ...student, rank: index + 1 }));
}