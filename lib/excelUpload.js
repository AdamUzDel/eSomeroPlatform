import * as XLSX from 'xlsx';
import { addStudent, getStudentByName, updateStudent, addMark } from './firebaseUtils';
import { classes } from '@/types';

export async function uploadStudentsFromExcel(file, selectedSheets, selectedClass, year, term, onProgress) {
  const workbook = XLSX.read(file, { type: 'buffer' });
  let totalProcessed = 0;
  let totalUploaded = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let errors = [];

  const sheets = selectedSheets.length > 0 ? selectedSheets : workbook.SheetNames;
  const totalStudents = sheets.reduce((sum, sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    return sum + XLSX.utils.sheet_to_json(worksheet).length;
  }, 0);

  const classConfig = classes.find(c => c.name === selectedClass);
  if (!classConfig) {
    throw new Error(`Class configuration not found for ${selectedClass}`);
  }

  for (const sheetName of sheets) {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    for (const row of jsonData) {
      try {
        // ... (student data processing remains the same)

        const markData = {
          subjects: {},
          total: row.TOT,
          average: row.AVE,
          rank: row.RANK,
          status: row.STATUS
        };

        for (const subject of classConfig.subjects) {
          if (row[subject.code] !== undefined) {
            markData.subjects[subject.code] = row[subject.code];
          } else {
            console.warn(`Missing mark for subject ${subject.code} in row:`, row);
            errors.push(`Missing mark for subject ${subject.code} for student ${studentData.name}`);
          }
        }

        await addMark(studentId, year, term, markData);

        totalProcessed++;
        if (onProgress) {
          onProgress(totalProcessed, totalStudents);
        }
      } catch (error) {
        console.error('Error processing row:', row, error);
        errors.push(`Error processing student ${row.NAME}: ${error.message}`);
        totalSkipped++;
      }
    }
  }


  console.log(`Upload complete. ${totalUploaded} students uploaded, ${totalUpdated} updated, ${totalSkipped} skipped.`);
  if (errors.length > 0) {
    console.error('Errors encountered during upload:', errors);
  }
  return { uploaded: totalUploaded, updated: totalUpdated, skipped: totalSkipped, errors };
}