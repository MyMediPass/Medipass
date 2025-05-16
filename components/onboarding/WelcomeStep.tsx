"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
    onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center text-center space-y-8 py-8"
        >
            <motion.h1
                className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "backOut" }}
            >
                Welcome to MediPass
            </motion.h1>
            <motion.p
                className="text-lg md:text-xl text-slate-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                Your personalized health companion. Let's get you set up.
            </motion.p>
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8, ease: "backOut" }}
            >
                <Button
                    onClick={onNext}
                    size="lg"
                    className="px-8 py-3 text-lg font-semibold bg-green-500 hover:bg-green-600 text-white transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                >
                    Get Started
                </Button>
            </motion.div>
        </motion.div>
    );
} 