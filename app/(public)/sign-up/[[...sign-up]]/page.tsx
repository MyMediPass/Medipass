import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="h-full flex-1 bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto items-center flex flex-col">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="h-12 w-12 rounded-lg bg-[hsl(165,70%,25%)] flex items-center justify-center mb-4 mx-auto shadow-sm">
                        <span className="text-white text-xl font-bold">M</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">MediPass</h1>
                    <p className="text-gray-600 text-sm">Your secure health connection</p>
                </div>

                {/* Sign Up Form */}
                <SignUp
                    appearance={{
                        elements: {
                            headerSubtitle: "hidden",
                            socialButtonsBlockButton: "w-full justify-center",
                            formButtonPrimary: "w-full bg-[hsl(165,70%,25%)] hover:bg-[hsl(165,70%,30%)]",
                            footerAction: "hidden"
                        }
                    }}
                />

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        Need help?{" "}
                        <a href="mailto:support@medipass.ai" className="text-[hsl(165,70%,25%)] hover:underline">
                            Contact support
                        </a>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        Protected by enterprise-grade encryption
                    </p>
                </div>
            </div>
        </div>
    )
} 