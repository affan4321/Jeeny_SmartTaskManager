'use client';

import { useRouter } from "next/navigation";
import { useCallback, memo } from "react";
import { ChevronRight, CheckCircle, Clock, Bell } from "lucide-react";
import BackgroundCanvas from "./BackgroundCanvas";

interface ClientHomeProps {
  hasEnvVars: boolean;
}

export const ClientHome = memo(function ClientHome({ hasEnvVars }: ClientHomeProps) {
  const router = useRouter();
  
  const handleGetStarted = useCallback(() => {
    router.push("/home");
  }, [router]);

  return (
    // <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-pink-900">
    <div className="min-h-screen bg-transparent">
      {/* Background Canvas */}
      <BackgroundCanvas />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements - keeping them subtle since canvas is the main background */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/5 to-rose-600/5 dark:from-pink-400/5 dark:to-rose-400/5" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-Jeeny to-pink-600 bg-clip-text text-transparent mb-6">
              Jeeny Task Manager
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Organize your life with the most intuitive task management solution. 
              <span className="font-semibold text-Jeeny dark:text-pink-400"> Simple, powerful, and beautiful.</span>
            </p>
            
            {/* CTA Button */}
            <button
              onClick={handleGetStarted}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-Jeeny to-pink-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="text-lg">Get Started</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-Jeeny to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            </button>
          </div>

          {/* Features Grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Easy Task Creation
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create and organize tasks with our intuitive interface. Add details, set priorities, and stay on track.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-Jeeny to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Time Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track deadlines, set due dates, and manage your time effectively with our smart scheduling features.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Smart Reminders
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Never miss a deadline with intelligent reminders that adapt to your schedule and preferences.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-bold bg-gradient-to-r from-Jeeny to-pink-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                10K+
              </div>
              <div className="text-gray-600 dark:text-gray-300">Tasks Completed</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold bg-gradient-to-r from-Jeeny to-pink-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                99%
              </div>
              <div className="text-gray-600 dark:text-gray-300">User Satisfaction</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold bg-gradient-to-r from-Jeeny to-pink-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                24/7
              </div>
              <div className="text-gray-600 dark:text-gray-300">Always Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
