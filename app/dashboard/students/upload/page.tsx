"use client"

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast, Toaster } from 'sonner';
import { uploadStudentsFromExcel } from '@/lib/excelUpload';
import { classes } from '@/types';
import { ArrowLeft, Upload } from 'lucide-react';

const years = [2024, 2025, 2026, 2027];
const terms = ['Term 1', 'Term 2', 'Term 3'];

export default function UploadStudents() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [term, setTerm] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Read sheet names
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        setSheets(workbook.SheetNames);
        setSelectedSheet(workbook.SheetNames[0]); // Select first sheet by default
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleUpload = useCallback(async () => {
    if (!file || !selectedSheet || !selectedClass || !year || !term) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setUploadErrors([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await uploadStudentsFromExcel(
        arrayBuffer,
        [selectedSheet],
        selectedClass,
        year,
        term,
        (processed: number, total: number) => setProgress(Math.round((processed / total) * 100))
      );
      toast.success(`Upload complete. ${result.uploaded} students uploaded, ${result.updated} updated, ${result.skipped} skipped.`);
      if (result.errors && result.errors.length > 0) {
        setUploadErrors(result.errors);
        toast.warning(`${result.errors.length} errors encountered during upload. Check the error list for details.`);
      }
    } catch (error) {
      toast.error('Error uploading file: ' + (error instanceof Error ? error.message : String(error)));
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [file, selectedSheet, selectedClass, year, term]);

  return (
    <div className="container mx-auto py-10 px-4">
      <Toaster />
      <Button variant="ghost" onClick={() => router.push('/dashboard/students')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Students
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Upload Students from Excel</CardTitle>
          <CardDescription>Select an Excel file and upload student data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
              Excel File
            </label>
            <Input id="file-upload" type="file" accept=".xlsx, .xls" onChange={handleFileChange} disabled={isUploading} />
          </div>
          
          {sheets.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="sheet-select" className="block text-sm font-medium text-gray-700">
                Select Worksheet
              </label>
              <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                <SelectTrigger id="sheet-select">
                  <SelectValue placeholder="Select Worksheet" />
                </SelectTrigger>
                <SelectContent>
                  {sheets.map(sheet => (
                    <SelectItem key={sheet} value={sheet}>{sheet}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="class-select" className="block text-sm font-medium text-gray-700">
              Select Class
            </label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger id="class-select">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(cls => (
                  <SelectItem key={cls.name} value={cls.name}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="year-select" className="block text-sm font-medium text-gray-700">
              Year
            </label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger id="year-select">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="term-select" className="block text-sm font-medium text-gray-700">
              Term
            </label>
            <Select value={term} onValueChange={setTerm}>
              <SelectTrigger id="term-select">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpload} disabled={isUploading || !file || !selectedSheet || !selectedClass || !year || !term} className="w-full">
            {isUploading ? 'Uploading...' : 'Upload'}
            <Upload className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
      
      {isUploading && (
        <div className="mt-4 space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-center">{progress}% complete</p>
        </div>
      )}
      {uploadErrors.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Upload Errors</CardTitle>
            <CardDescription>The following errors were encountered during the upload process:</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {uploadErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-600">{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}