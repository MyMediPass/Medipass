import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, FileText, HeartPulse, MessageSquare, Shield, Stethoscope } from "lucide-react"

import { getUser } from "@/lib/auth"

export default async function Home() {
  const user = await getUser()
  const isAuthenticated = !!user

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Background Video */}
      <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8944275-uhd_3840_2160_25fps%20%281%29-0n9gfREplLrchnXYgne8VJj4IZ1uLL.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 z-10"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-20">
          <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-3xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white">
                MediPass - <em>Your AI Personal Health Passport</em>
              </h1>
              <p className="max-w-[600px] text-white/80 md:text-xl mx-auto">
                Manage your health records, track medications, and get personalized insights all in one place.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row justify-center">
              <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                <Button size="lg" className="w-full sm:w-auto">
                  {isAuthenticated ? "Visit Your Dashboard" : "Get Started"}
                </Button>
              </Link>
              <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 border-white/20"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Comprehensive Health Management
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Everything you need to manage your health journey in one secure platform.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <HeartPulse className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">Health Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Monitor vital signs, lab results, and health metrics over time with visual trends.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Stethoscope className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">Medical Records</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Store and access your complete medical history, doctor visits, and diagnoses.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <FileText className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">Document Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Upload and organize medical documents, lab reports, and prescriptions.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <MessageSquare className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">AI Health Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Get personalized health insights and answers to your medical questions.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Shield className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Your health data is encrypted and protected with the highest security standards.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <CheckCircle2 className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">Medication Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Track medications, set reminders, and manage refills all in one place.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to take control of your health?
              </h2>
              <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of users who are managing their health more effectively with MediPass.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full min-[400px]:w-auto">
                  Sign Up Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
