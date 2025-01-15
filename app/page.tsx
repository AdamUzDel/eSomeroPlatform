'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchSchools } from '@/lib/schoolUtils'

interface School {
  id: string
  name: string
  url: string
}

export default function WelcomePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [schools, setSchools] = useState<School[]>([])
  const router = useRouter()

  const handleOpenDialog = async () => {
    setIsDialogOpen(true)
    try {
      const fetchedSchools = await fetchSchools()
      setSchools(fetchedSchools)
    } catch (error) {
      console.error('Error fetching schools:', error)
      // Handle error (e.g., show an error message to the user)
    }
  }

  const handleSchoolSelect = (url: string) => {
    setIsDialogOpen(false)
    router.push(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col justify-center items-center p-4 md:p-8">
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">Welcome to eSomero</h1>
      <p className="text-xl md:text-2xl text-center mb-8 max-w-2xl">
        Streamline your school management with our comprehensive solution. 
        Manage students, track performance, and generate report cards effortlessly.
      </p>
      <div className="space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row">
        <Button size="lg" onClick={handleOpenDialog}>
          Enter School Dashboard
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="https://bytebasetech.com/projects/esomero">Learn More</Link>
        </Button>
      </div>
      <div id="features" className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
        <FeatureCard 
          title="Student Management" 
          description="Easily add, edit, and manage student information in one place."
        />
        <FeatureCard 
          title="Performance Tracking" 
          description="Record and analyze student performance across terms and years."
        />
        <FeatureCard 
          title="Report Generation" 
          description="Generate comprehensive report cards with just a few clicks."
        />
      </div>
      <SchoolSelectionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        schools={schools}
        onSchoolSelect={handleSchoolSelect}
      />
    </div>
  )
}

function FeatureCard({ title, description }: { title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p>{description}</p>
    </div>
  )
}

function SchoolSelectionDialog({ 
  isOpen, 
  onClose, 
  schools, 
  onSchoolSelect 
}: { 
  isOpen: boolean
  onClose: () => void
  schools: School[]
  onSchoolSelect: (url: string) => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Your School</DialogTitle>
          <DialogDescription>
            Choose your school from the list below to access your dashboard.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-4 max-h-[60vh]">
          <div className="space-y-2">
            {schools.map((school) => (
              <Button
                key={school.id}
                variant="outline"
                className="w-full justify-start text-gary-200"
                onClick={() => onSchoolSelect(school.url)}
              >
                {school.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}