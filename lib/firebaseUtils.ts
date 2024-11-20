// lib/firebaseUtils.ts
import { db, storage } from './firebase';
import { collection, doc, setDoc, getDocs, getDoc, query, where, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Student, StudentMark, YearData, TermData, Mark, ReportCardMark } from '@/types';

export const addStudent = async (student: Omit<Student, 'id'>): Promise<string> => {
  const docRef = doc(collection(db, 'students'));
  await setDoc(docRef, student);
  return docRef.id;
};

export async function updateStudent(id: string, data: Partial<Student>) {
  if (!id) {
    throw new Error('Student ID is required for update');
  }
  
  try {
    const studentRef = doc(db, 'students', id);
    await updateDoc(studentRef, data);
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
}

export const deleteStudent = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'students', id));
};

export const getStudents = async (className: string): Promise<Student[]> => {
  if (!className) {
    console.warn('No class name provided to getStudents function');
    return [];
  }
  const q = query(
    collection(db, 'students'),
    //orderBy('name', 'asc'),
    where('class', '==', className)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
};

export const getStudentById = async (id: string): Promise<Student> => {
  const docRef = doc(db, 'students', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Student;
  } else {
    throw new Error('Student not found');
  }
};

export async function getStudentByName(name: string) {
  try {
    const q = query(collection(db, 'students'), where('name', '==', name));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting student by name:', error);
    throw error;
  }
}

export async function getStudentsByClass(className: string): Promise<Student[]> {
  try {
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where('class', '==', className));
    const querySnapshot = await getDocs(q);
    
    const students: Student[] = [];
    querySnapshot.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() } as Student);
    });
    
    return students.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error getting students by class:', error);
    throw error;
  }
}

// Define a new interface specifically for the addMark function
interface AddMarkData {
  subjects: { [key: string]: number };
  total: number;
  average: number;
  status: string;
  rank?: number; // Make rank optional in the input data
}

export async function addMark(studentId: string, year: string, term: string, markData: AddMarkData) {
  try {
    const markRef = doc(db, 'marks', studentId, year, term);
    
    // Use the existing rank if provided, otherwise default to 0
    const rank = markData.rank !== undefined ? markData.rank : 0;

    const fullMarkData: Mark = {
      ...markData,
      rank
    };

    await setDoc(markRef, { [term]: fullMarkData }, { merge: true });
  } catch (error) {
    console.error('Error adding mark:', error);
    throw error;
  }
}

export async function updateMark(studentId: string, year: string, term: string, markData: Omit<Mark, 'rank'>) {
  try {
    const markRef = doc(db, 'marks', studentId, year, term);
    
    // Calculate rank (you may want to implement a more sophisticated ranking system)
    const rank = 0; // placeholder, implement actual ranking logic

    const fullMarkData: Mark = {
      ...markData,
      rank
    };

    await updateDoc(markRef, { [term]: fullMarkData });
  } catch (error) {
    console.error('Error updating mark:', error);
    throw error;
  }
}

export const getMarks = async (studentId: string): Promise<YearData> => {
  const marksRef = doc(db, 'marks', studentId);
  const yearData: YearData = {};

  // Directly access the "2024" collection for the specified student
  const termCollections = await getDocs(collection(marksRef, "2024"));

  for (const termDoc of termCollections.docs) {
    const term = termDoc.id;
    yearData[term] = termDoc.data() as TermData;
  }

  return yearData;
};
/* 
export async function getStudentMarks(className: string, year: string, term: string): Promise<StudentMark[]> {
  try {
    // 1. Get all students in the specified class
    const studentsRef = collection(db, 'students');
    const studentsQuery = query(studentsRef, where('class', '==', className));
    const studentsSnapshot = await getDocs(studentsQuery);

    // 2. Prepare promises for fetching marks
    const marksPromises = studentsSnapshot.docs.map(async (studentDoc) => {
      const studentId = studentDoc.id;
      const studentName = studentDoc.data().name;
      const markRef = doc(db, 'marks', studentId, year, term);
      const markSnapshot = await getDoc(markRef);
      return { studentId, studentName, markSnapshot };
    });

    // 3. Fetch all marks in parallel
    const marksResults = await Promise.all(marksPromises);

    // 4. Process marks data
    const studentMarks: StudentMark[] = marksResults
      .map(({ studentId, studentName, markSnapshot }) => {
        if (markSnapshot.exists()) {
          const markData = markSnapshot.data() as Mark;
          return {
            id: studentId,
            name: studentName,
            subjects: markData.subjects,
            average: markData.average,
            rank: markData.rank,
            status: markData.status,
            total: markData.total
          };
        }
        return null;
      })
      .filter((mark): mark is StudentMark => mark !== null)
      .sort((a, b) => a.rank - b.rank);

    return studentMarks;
  } catch (error) {
    console.error('Error getting student marks:', error);
    throw error;
  }
}
 */

/* export async function getStudentMarks(className: string, year: string, term: string): Promise<StudentMark[]> {
  try {
    // First, get all students in the specified class
    const studentsRef = collection(db, 'students');
    const studentsQuery = query(studentsRef, where('class', '==', className));
    const studentsSnapshot = await getDocs(studentsQuery);

    const studentMarks: StudentMark[] = [];

    // For each student, fetch their marks
    for (const studentDoc of studentsSnapshot.docs) {
      const studentId = studentDoc.id;
      const studentName = studentDoc.data().name;

      // Construct the path to the student's marks for the specified year and term
      const markRef = doc(db, 'marks', studentId, year, term);
      const markSnapshot = await getDoc(markRef);

      if (markSnapshot.exists()) {
        const markData = markSnapshot.data() as { [key: string]: Mark };
        const termData = markData[term];

        if (termData) {
          // Construct the StudentMark object
          const studentMark: StudentMark = {
            id: studentId,
            name: studentName,
            subjects: termData.subjects,
            average: termData.average,
            rank: termData.rank,
            status: termData.status,
            total: termData.total
          };

          studentMarks.push(studentMark);
        }
      }
    }

    // Sort the studentMarks array by rank
    studentMarks.sort((a, b) => a.rank - b.rank);

    return studentMarks;
  } catch (error) {
    console.error('Error getting student marks:', error);
    throw error;
  }
} */

export async function getStudentMarks(
  className: string,
  year: string,
  term: string
): Promise<StudentMark[]> {
  try {
    // Fetch all students in the specified class
    const studentsRef = collection(db, 'students');
    const studentsQuery = query(studentsRef, where('class', '==', className));
    const studentsSnapshot = await getDocs(studentsQuery);

    // Map student data to an array of student details
    const studentIds = studentsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name as string, // Explicitly cast name to string
    }));

    // Fetch marks for each student in parallel
    const marksPromises = studentIds.map(async ({ id, name }) => {
      const markRef = doc(db, 'marks', id, year, term);
      const markSnapshot = await getDoc(markRef);

      if (markSnapshot.exists()) {
        const termData = markSnapshot.data() as TermData;
        const markData = termData[term]; // Access the specific term's data

        if (markData) {
          return {
            id,
            name,
            subjects: markData.subjects,
            average: markData.average,
            rank: markData.rank,
            status: markData.status,
            total: markData.total,
          } as StudentMark; // Ensure the returned object conforms to StudentMark
        }
      }
      return null; // Return null for students without marks data
    });

    // Resolve all marks promises and filter out null results
    const studentMarks = (await Promise.all(marksPromises)).filter(
      mark => mark !== null
    ) as StudentMark[];

    // Sort the marks by rank
    studentMarks.sort((a, b) => a.rank - b.rank);

    return studentMarks;
  } catch (error) {
    console.error('Error getting student marks:', error);
    throw error;
  }
}


export async function getStudentMarksForAllTerms(studentClass: string, year: string, studentId: string): Promise<ReportCardMark[]> {
  console.log(`Fetching marks for student ${studentId}, class ${studentClass}, year ${year}`)
  
  const studentMarksRef = collection(db, "marks", studentId, year)
  console.log('Collection reference:', studentMarksRef.path)
  
  const studentMarksDocs = await getDocs(studentMarksRef)

  if (studentMarksDocs.empty) {
    console.log(`No documents found in collection: ${studentMarksRef.path}`)
    return []
  }

  const termsData: ReportCardMark[] = []

  studentMarksDocs.forEach((doc) => {
    console.log(`Document ${doc.id} data:`, doc.data())
    const docData = doc.data()
    
    // Iterate through Term 1, Term 2, Term 3
    for (const termKey in docData) {
      if (docData.hasOwnProperty(termKey) && termKey.startsWith('Term')) {
        const termData = docData[termKey] as ReportCardMark
        console.log(`${termKey} data:`, termData)
        
        termsData.push({
          id: `${studentId}-${year}-${termKey}`,
          class: studentClass,
          year: year,
          term: termKey,
          average: termData.average || 0,
          rank: termData.rank || 0,
          status: termData.status || '',
          subjects: termData.subjects || {},
          total: termData.total || 0
        })
      }
    }
  })

  console.log('Processed results:', termsData)

  // Sort the terms data by term number
  termsData.sort((a, b) => {
    const termNumberA = parseInt(a.term.split(' ')[1])
    const termNumberB = parseInt(b.term.split(' ')[1])
    return termNumberA - termNumberB
  })

  return termsData
}

export async function getClassMarksForYear(className: string, year: string): Promise<ReportCardMark[]> {
  try {
    const studentsRef = collection(db, 'students');
    const studentsQuery = query(studentsRef, where('class', '==', className));
    const studentsSnapshot = await getDocs(studentsQuery);

    const classMarks: ReportCardMark[] = [];

    for (const studentDoc of studentsSnapshot.docs) {
      const studentId = studentDoc.id;
      const marksRef = collection(db, 'marks', studentId, year);
      const markSnapshot = await getDocs(marksRef);

      for (const marksSnapshot of markSnapshot.docs){
        if (marksSnapshot.exists()) {
          const marksData = marksSnapshot.data();
          for (const term in marksData) {
            if (marksData.hasOwnProperty(term)) {
              const termData = marksData[term] as ReportCardMark;
              classMarks.push({
                ...termData,
                id: `${studentId}-${year}-${term}`,
                class: className,
                year: year,
                term: term,
              });
            }
          }
        }
      }
    }

    return classMarks;
  } catch (error) {
    console.error('Error getting class marks for year:', error);
    throw error;
  }
}

export async function getClassAverageScores(className: string, year: string): Promise<number[]> {
  console.log(`Fetching class average scores for class ${className}, year ${year}`);

  // Fetch all students in the class
  const studentsRef = collection(db, 'students');
  const studentsQuery = query(studentsRef, where('class', '==', className));
  const studentsSnapshot = await getDocs(studentsQuery);

  const averageScores: number[] = [];

  for (const studentDoc of studentsSnapshot.docs) {
    const studentId = studentDoc.id;
    console.log(`Processing student: ${studentId}`);

    // Use the existing getStudentMarksForAllTerms function
    const studentMarks = await getStudentMarksForAllTerms(className, year, studentId);

    if (studentMarks.length > 0) {
      // Calculate the average score for this student across all terms
      const studentAverage = studentMarks.reduce((sum, term) => sum + term.average, 0) / studentMarks.length;
      console.log(`Average score for student ${studentId}: ${studentAverage}`);
      averageScores.push(studentAverage);
    } else {
      console.log(`No marks found for student ${studentId}`);
    }
  }

  console.log(`Class average scores: ${averageScores}`);
  return averageScores;
}

export async function addStudentMarks(
  studentName: string,
  className: string,
  year: string,
  term: string,
  subjects: { [key: string]: number }
) {
  try {
    const studentsRef = collection(db, 'students');
    const studentQuery = query(studentsRef, where('name', '==', studentName), where('class', '==', className));
    const studentSnapshot = await getDocs(studentQuery);

    if (studentSnapshot.empty) {
      throw new Error('Student not found');
    }

    const studentId = studentSnapshot.docs[0].id;
    const total = Object.values(subjects).reduce((sum, mark) => sum + mark, 0);
    const average = total / Object.keys(subjects).length;

    const markData: Mark = {
      subjects,
      total,
      average,
      rank: 0, // You may want to implement a ranking system
      status: average >= 50 ? 'PASS' : 'FAIL'
    };

    const markRef = doc(db, 'marks', studentId, year, term);
    await setDoc(markRef, { [term]: markData }, { merge: true });

    return studentId;
  } catch (error) {
    console.error('Error adding student marks:', error);
    throw error;
  }
}

export async function updateStudentMarks(
  studentId: string,
  className: string,
  year: string,
  term: string,
  subjects: { [key: string]: number }
) {
  try {
    
    const total = Object.values(subjects).reduce((sum, mark) => sum + mark, 0);
    const average = total / Object.keys(subjects).length;

    const markData: Mark = {
      subjects,
      total,
      average,
      rank: 0, // You may want to implement a ranking system
      status: average >= 50 ? 'PASS' : 'FAIL'
    };

    const markRef = doc(db, 'marks', studentId, year, term);
    await updateDoc(markRef, { [term]: markData });
  } catch (error) {
    console.error('Error updating student marks:', error);
    throw error;
  }
}

export const uploadImage = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};