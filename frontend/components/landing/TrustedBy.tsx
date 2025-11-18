export default function TrustedBy() {
  const companies = [
    "TechCorp",
    "Global Solutions",
    "InnovateTech",
    "Enterprise Systems",
    "Digital Dynamics",
    "FutureWorks"
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-sm font-semibold text-[var(--gray-500)] uppercase tracking-wide mb-8">
          Trusted by Leading Organizations
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {companies.map((company, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all"
            >
              <div className="text-2xl font-bold text-[var(--gray-400)] hover:text-[var(--emerald)] transition-colors">
                {company}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
