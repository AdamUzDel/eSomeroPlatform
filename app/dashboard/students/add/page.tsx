"use client"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import NextImage from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { addStudent, uploadImage } from '@/lib/firebaseUtils'
import { Student, classes } from '@/types'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { toast, Toaster } from 'sonner'
import { ArrowLeft, Save, Camera, Upload, User } from 'lucide-react'

export default function AddStudentForm() {
  const router = useRouter()
  const [student, setStudent] = useState<Omit<Student, 'id'>>({ name: '', class: '', sex: '', photo: '' })
  const [image, setImage] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [isCaptureDialogOpen, setIsCaptureDialogOpen] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let photoUrl = ''
      if (image) {
        const resizedImage = await resizeImage(image)
        const file = dataURLtoFile(resizedImage, 'student.jpg')
        photoUrl = await uploadImage(file, `students/new-${Date.now()}.jpg`)
      }

      const newStudentId = await addStudent({ ...student, photo: photoUrl })
      toast.success('Student added successfully')
      router.push(`/dashboard/students/${newStudentId}`)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error(`Failed to add student: ${errorMessage}`)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      toast.error('Failed to access camera')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
  }

  const handleCaptureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d')?.drawImage(video, 0, 0)
      const capturedImage = canvas.toDataURL('image/jpeg')
      setImage(capturedImage)
      stopCamera()
      setIsCaptureDialogOpen(false)
    }
  }

  const handleCropComplete = (crop: Crop) => {
    setCrop(crop)
  }

  const resizeImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        let { width, height } = img
        const aspectRatio = width / height

        // Resize to have a maximum dimension of 200px
        if (width > height) {
          width = 200
          height = width / aspectRatio
        } else {
          height = 200
          width = height * aspectRatio
        }

        canvas.width = width
        canvas.height = height

        ctx.drawImage(img, 0, 0, width, height)

        // Reduce quality until file size is less than 10KB
        let quality = 0.7
        let resizedDataUrl
        do {
          resizedDataUrl = canvas.toDataURL('image/jpeg', quality)
          quality -= 0.05
        } while (resizedDataUrl.length > 13333 && quality > 0.1) // 13333 bytes ≈ 10KB

        resolve(resizedDataUrl)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = dataUrl
    })
  }

  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Toaster />
      <Button variant="ghost" onClick={() => router.push('/dashboard/students')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Students
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Add New Student</CardTitle>
          <CardDescription>Enter the student's details below</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={student.name}
                onChange={(e) => setStudent({...student, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select 
                value={student.class} 
                onValueChange={(value) => setStudent({...student, class: value})}
              >
                <SelectTrigger id="class">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.name} value={cls.name}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select 
                value={student.sex} 
                onValueChange={(value) => setStudent({...student, sex: value})}
              >
                <SelectTrigger id="sex">
                  <SelectValue placeholder="Select Sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Photo</Label>
              <div className="flex space-x-2">
                <Dialog open={isCaptureDialogOpen} onOpenChange={setIsCaptureDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" onClick={startCamera}>
                      <Camera className="mr-2 h-4 w-4" />
                      Use Camera
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Capture Photo</DialogTitle>
                      <DialogDescription>Take a photo using your device's camera.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                      <video ref={videoRef} autoPlay playsInline className="w-full max-w-sm mx-auto" />
                    </div>
                    <Button onClick={handleCaptureImage}>Capture</Button>
                  </DialogContent>
                </Dialog>
                <Label htmlFor="photo" className="cursor-pointer">
                  <div className="flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </div>
                </Label>
                <Input id="photo" type="file" onChange={handleImageChange} accept="image/*" className="hidden" />
              </div>
            </div>
            {image && (
              <div className="mt-4">
                <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={handleCropComplete}>
                  <NextImage src={image} alt="Student" width={300} height={300} />
                </ReactCrop>
              </div>
            )}
            {!image && (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-16 h-16 text-gray-500" />
              </div>
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}