// app/page.tsx
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col justify-center items-center p-4 md:p-8">
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">Welcome to SchoolSync</h1>
      <p className="text-xl md:text-2xl text-center mb-8 max-w-2xl">
        Streamline your school management with our comprehensive solution. 
        Manage students, track performance, and generate report cards effortlessly.
      </p>
      <div className="space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row">
        <Button asChild size="lg">
          <Link href="/dashboard">Enter Dashboard</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="#features">Learn More</Link>
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