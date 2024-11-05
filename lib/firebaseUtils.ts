// lib/firebaseUtils.ts
import { db, storage } from './firebase';
import { collection, doc, setDoc, getDocs, getDoc, query, where, deleteDoc, updateDoc, DocumentData } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Student, StudentMark, YearData, TermData, Mark } from '@/types';

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

/* export const getStudents = async (className: string): Promise<Student[]> => {
  if (!className) {
    console.warn('No class name provided to getStudents function');
    return [];
  }
  const q = query(collection(db, 'students'), where('class', '==', className) );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
}; */

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

export async function addMark(studentId: string, year: string, term: string, markData: any) {
  if (!studentId) {
    throw new Error('Student ID is required for adding marks');
  }

  try {
    // Create a reference to the year document
    const yearRef = doc(db, 'marks', studentId, year, term);

    // Use setDoc with merge: true to ensure the year document exists
    await setDoc(yearRef, {}, { merge: true });

    // Now, set the term data as a field in the year document
    await updateDoc(yearRef, {
      [term]: markData
    });

    console.log(`Mark added for student ${studentId}, year ${year}, term ${term}`);
  } catch (error) {
    console.error('Error adding mark:', error);
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


export async function getStudentMarks(className: string, year: string, term: string): Promise<StudentMark[]> {
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
        const markData = markSnapshot.data() as Mark;

        // Construct the StudentMark object
        const studentMark: StudentMark = {
          id: studentId,
          name: studentName,
          subjects: markData.subjects,
          average: markData.average,
          rank: markData.rank,
          status: markData.status
        };

        studentMarks.push(studentMark);
      }
    }

    // Sort the studentMarks array by rank
    studentMarks.sort((a, b) => a.rank - b.rank);

    return studentMarks;
  } catch (error) {
    console.error('Error getting student marks:', error);
    throw error;
  }
}

export const uploadImage = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

/* export const getMarks = async (studentId: string): Promise<YearData> => {
  const marksRef = doc(db, 'marks', studentId);
  const yearData: YearData = {};

  console.log("marksRef: ", marksRef)

  const yearCollections = await getDocs(collection(marksRef, "year"));

  for (const yearDoc of yearCollections.docs) {
    const year = yearDoc.id;
    const termCollections = await getDocs(collection(marksRef, year));
    
    console.log("Term collection: ", termCollections)
    yearData[year] = {};
    
    for (const termDoc of termCollections.docs) {
      const term = termDoc.id;
      yearData[year][term] = termDoc.data() as Mark;
    }
  }
  
  return yearData;
}; */

/* export const getMarks = async (studentId: string, year: string): Promise<YearData> => {
  const marksRef = doc(db, 'marks', studentId, year); // Reference to the specific year document
  const marksSnapshot = await getDoc(marksRef);

  if (!marksSnapshot.exists()) {
    throw new Error("No marks found for the specified year.");
  }

  return marksSnapshot.data() as YearData; // Return the data cast to YearData type
}; */

/* // lib/firebaseUtils.ts
import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { Student, Mark } from '../types';

export const addStudent = async (student: Omit<Student, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'students'), student);
  return docRef.id;
};

export const updateStudent = async (id: string, data: Partial<Student>): Promise<void> => {
  await updateDoc(doc(db, 'students', id), data);
};

export const deleteStudent = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'students', id));
};

export const getStudents = async (): Promise<Student[]> => {
  const querySnapshot = await getDocs(collection(db, 'students'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
};

export const addMark = async (mark: Mark): Promise<string> => {
  const docRef = await addDoc(collection(db, 'marks'), mark);
  return docRef.id;
};

export const getMarks = async (studentId: string, term: number): Promise<Mark | null> => {
  const q = query(collection(db, 'marks'), where('studentId', '==', studentId), where('term', '==', term));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  return { studentId: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Mark;
};

export const getClassMarks = async (className: string, term: number): Promise<Mark[]> => {
  const q = query(collection(db, 'marks'), where('class', '==', className), where('term', '==', term));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ studentId: doc.id, ...doc.data() } as Mark));
};

export const uploadImage = async (file: File, path: string): Promise<string> => {
  // Implement image upload logic here
  // This is a placeholder function, you'll need to implement the actual upload logic
  console.log('Uploading image:', file, 'to path:', path);
  return 'https://example.com/uploaded-image-url.jpg';
}; */