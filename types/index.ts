// types/index.ts

export interface Subject {
  name: string;
  code: string;
}

export interface StudentMark {
  id: string;
  name: string;
  subjects: { [key: string]: number };
  average: number;
  rank: number;
  status: string;
  total: number;
}

export interface Mark {
  average: number;
  rank: number;
  status: string;
  subjects: { [key: string]: number };
  total: number;
}

export interface Class {
  name: string;
  subjects: Subject[];
}

export interface Student {
  id: string;
  name: string;
  class: string;
  sex: string;
  photo?: string;
}

/* export interface Mark {
  subjects: { [subjectCode: string]: number };
  total: number;
  average: number;
  rank: number;
  status: string;
} */

export interface TermData {
  [term: string]: Mark;
}

export interface YearData {
  [year: string]: TermData;
}

export interface ExcelRowData {
  NAME: string;
  SEX: string;
  [subjectCode: string]: string | number;
  TOT: number;
  AVE: number;
  RANK: number;
  STATUS: string;
}

const s1Subjects = [
  { name: "English", code: "ENG" },
  { name: "Mathematics", code: "MATH" },
  { name: "Christian Religious Education", code: "CRE" },
  { name: "Citizenship", code: "C/SHIP" },
  { name: "Chemistry", code: "CHEM" },
  { name: "Biology", code: "BIOS" },
  { name: "Physics", code: "PHY" },
  { name: "Agriculture", code: "AGRI" },
  { name: "Geography", code: "GEO" },
  { name: "History", code: "HIST" },
  { name: "Commerce", code: "COMM" },
  { name: "Arabic", code: "ARA" },
  { name: "Computer", code: "COMP" },
  { name: "Physical Education", code: "P.O.A" },
];

const prepSubjects = [
  { name: "English", code: "ENG" },
  { name: "Mathematics", code: "MATH" },
  { name: "Christian Religious Education", code: "CRE" },
  { name: "Chemistry", code: "CHEM" },
  { name: "Biology", code: "BIOS" },
  { name: "Physics", code: "PHY" }
];

const s3S4ScienceSubjects = [
  { name: "English", code: "ENG" },
  { name: "Mathematics", code: "MATH" },
  { name: "Christian Religious Education", code: "CRE" },
  { name: "Citizenship", code: "C/SHIP" },
  { name: "Chemistry", code: "CHEM" },
  { name: "Biology", code: "BIOS" },
  { name: "Physics", code: "PHY" },
  { name: "Agriculture", code: "AGRI" },
  { name: "Additional Maths", code: "ADD MATH" },
  { name: "Computer", code: "COMP" }
]

const s3s4ArtSubjects = [
  { name: "English", code: "ENG" },
  { name: "Mathematics", code: "MATH" },
  { name: "Christian Religious Education", code: "CRE" },
  { name: "Citizenship", code: "C/SHIP" },
  { name: "Geography", code: "GEO" },
  { name: "History", code: "HIST" },
  { name: "Commerce", code: "COMM" },
  { name: "Literature", code: "LIT" },
  { name: "Computer", code: "COMP" },
  { name: "Physical Education", code: "P.O.A" }
];

export const classes: Class[] = [
  {
    name: "PREP-A",
    subjects: prepSubjects
  },
  {
    name: "PREP-B",
    subjects: prepSubjects
  },
  {
    name: "S1A",
    subjects: s1Subjects
  },
  {
    name: "S1B",
    subjects: s1Subjects
  },
  {
    name: "S1C",
    subjects: s1Subjects
  },
  {
    name: "S1D",
    subjects: s1Subjects
  },
  {
    name: "S1E",
    subjects: s1Subjects
  },
  {
    name: "S2A",
    subjects: s1Subjects
  },
  {
    name: "S2B",
    subjects: s1Subjects
  },
  {
    name: "S3A",
    subjects: s3S4ScienceSubjects
  },
  {
    name: "S3B",
    subjects: s3s4ArtSubjects
  },
  {
    name: "S4A",
    subjects: s3S4ScienceSubjects
  },
  {
    name: "S4B",
    subjects: s3s4ArtSubjects
  },
]; 

export const years = ['2024', '2025', '2026', '2027'];
export const terms = ['Term 1', 'Term 2', 'Term 3'];
