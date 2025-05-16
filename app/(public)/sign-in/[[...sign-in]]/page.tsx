import Image from "next/image"
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex min-h-screen">
            {/* Left side - Image/Background */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[hsl(165,70%,25%)]">
                <div className="absolute inset-0 bg-[hsl(165,70%,25%)] bg-opacity-80 z-10"></div>
                <Image
                    src="/placeholder.svg?height=1080&width=1080"
                    alt="Medical professionals"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="relative z-20 flex flex-col justify-center items-center w-full h-full text-white p-12">
                    <h1 className="text-4xl font-bold mb-6">Medipass</h1>
                    <p className="text-xl max-w-md text-center">Your AI Personal Health Passport</p>
                </div>
            </div>

            {/* Right side - Sign In Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-4 lg:hidden">
                            <div className="h-12 w-12 rounded-full bg-[hsl(165,70%,25%)] flex items-center justify-center">
                                <span className="text-white text-xl font-bold">M</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
                        <p className="mt-2 text-gray-600">Sign in to your Medipass account</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <SignIn />
                    </div>

                    <div className="text-center text-sm text-gray-500">
                        <p>
                            Need help?{" "}
                            <a href="#" className="text-[hsl(165,70%,25%)] hover:underline">
                                Contact support
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}