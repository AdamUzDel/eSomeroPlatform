import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

interface School {
  id: string;
  name: string;
  url: string;
}

export async function fetchSchools(): Promise<School[]> {
  try {
    const schoolsCollection = collection(db, 'esomero-schools');
    const schoolSnapshot = await getDocs(schoolsCollection);
    
    const schools: School[] = schoolSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.school,
        url: data.url
      };
    });

    return schools;
  } catch (error) {
    console.error('Error fetching schools:', error);
    throw error;
  }
}