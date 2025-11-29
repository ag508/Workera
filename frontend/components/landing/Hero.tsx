import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import GradientText from "@/components/reactbits/GradientText"
import ShinyText from "@/components/reactbits/ShinyText"

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[var(--gray-50)] pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 lg:pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left: Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-4 sm:mb-6">
              <Image
                src="/images/brand/Workera_Text_logo.png"
                alt="Workera"
                width={200}
                height={60}
                className="mx-auto lg:mx-0 w-32 sm:w-40 lg:w-[200px] h-auto"
                priority
              />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 text-[var(--gray-900)]">
              Intelligent Resume Parsing and{" "}
              <GradientText
                colors={["#00e0a5", "#00c490", "#00a87a", "#00c490", "#00e0a5"]}
                animationSpeed={4}
                showBorder={false}
                className="block sm:inline"
              >
                Recruitment Automation
              </GradientText>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-[var(--gray-600)] mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
              <ShinyText
                text="Powered by advanced LLM technology, Workera automates end-to-end hiring workflows—from resume parsing to semantic candidate matching—so you can find top talent faster."
                disabled={false}
                speed={3}
                className="text-gray-600"
              />
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/demo">
                <Button size="xl" variant="default">
                  Try Demo
                </Button>
              </Link>
              <Link href="/book-demo">
                <Button size="xl" variant="outline">
                  Book a Demo
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-[var(--gray-500)]">
              Trusted by Fortune 500 companies worldwide
            </p>
          </div>

          {/* Right: Hero Graphic */}
          <div className="flex-1 w-full">
            <div className="relative">
              <div className="glass rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl">
                <div className="bg-gradient-to-br from-[var(--emerald)] to-[var(--mint)] rounded-xl p-4 sm:p-6 lg:p-8 text-white">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--emerald)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg">AI-Powered Matching</h3>
                      <p className="text-xs sm:text-sm text-white/80">Real-time candidate scoring</p>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="bg-white/20 backdrop-blur rounded-lg p-3 sm:p-4">
                      <div className="flex justify-between items-center mb-1 sm:mb-2">
                        <span className="text-xs sm:text-sm font-medium">Match Score</span>
                        <span className="text-base sm:text-lg font-bold">94%</span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-1.5 sm:h-2">
                        <div className="bg-white rounded-full h-1.5 sm:h-2" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg p-3 sm:p-4">
                      <div className="flex justify-between items-center mb-1 sm:mb-2">
                        <span className="text-xs sm:text-sm font-medium">Skills Match</span>
                        <span className="text-base sm:text-lg font-bold">87%</span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-1.5 sm:h-2">
                        <div className="bg-white rounded-full h-1.5 sm:h-2" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg p-3 sm:p-4">
                      <div className="flex justify-between items-center mb-1 sm:mb-2">
                        <span className="text-xs sm:text-sm font-medium">Experience Fit</span>
                        <span className="text-base sm:text-lg font-bold">92%</span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-1.5 sm:h-2">
                        <div className="bg-white rounded-full h-1.5 sm:h-2" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[var(--gold)] rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[var(--mint)] rounded-full opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
