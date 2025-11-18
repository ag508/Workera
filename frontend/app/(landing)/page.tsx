import Hero from "@/components/landing/Hero"
import TrustedBy from "@/components/landing/TrustedBy"
import Features from "@/components/landing/Features"
import WhyWorkera from "@/components/landing/WhyWorkera"
import Footer from "@/components/landing/Footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <TrustedBy />
      <Features />
      <WhyWorkera />
      <Footer />
    </div>
  )
}
