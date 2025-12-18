import Link from 'next/link';
import { Briefcase, Users, Home } from 'lucide-react';
import Image from 'next/image';

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-[1300px] justify-center">
        {/* Simple Demo Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 flex w-[275px] flex-col justify-between border-r border-gray-100 bg-white px-6 py-6">
          <div>
            <div className="mb-6 flex items-center gap-3 px-2">
                <Image
                   src="/images/brand/Workera_logo_icon.png"
                   alt="Workera"
                   width={32}
                   height={32}
                   className="h-8 w-8 object-contain"
                />
                <span className="text-xl font-bold tracking-tight text-gray-900">Workera Demo</span>
            </div>
            <nav className="space-y-1">
                <Link href="/demo" className="flex items-center gap-4 rounded-full px-4 py-3 text-lg font-semibold text-primary bg-primary/10 transition-colors">
                    <Briefcase className="h-6 w-6 stroke-[2.5px]" />
                    <span>Jobs</span>
                </Link>
                <div className="flex items-center gap-4 rounded-full px-4 py-3 text-lg text-gray-400 cursor-not-allowed group">
                    <Users className="h-6 w-6 group-hover:text-gray-500" />
                    <span className="group-hover:text-gray-500">Candidates</span>
                </div>
                 <div className="flex items-center gap-4 rounded-full px-4 py-3 text-lg text-gray-400 cursor-not-allowed group">
                    <Home className="h-6 w-6 group-hover:text-gray-500" />
                    <span className="group-hover:text-gray-500">Overview</span>
                </div>
            </nav>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 border border-blue-100">
             <p className="font-semibold mb-1">Demo Mode</p>
             <p className="opacity-80 mb-3">You are exploring with mock data. Changes won't be saved.</p>
             <Link href="/dashboard" className="block w-full py-2 bg-blue-600 text-white text-center rounded-lg font-bold hover:bg-blue-700 transition-colors">
               Login to Real App
             </Link>
          </div>
        </div>

        {/* Main Content */}
        <main className="ml-[275px] flex min-w-0 flex-1 flex-col border-r border-gray-100 xl:mr-[350px]">
           <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-md">
             <h1 className="text-xl font-bold text-gray-900">Jobs (Demo)</h1>
           </div>
           <div className="p-4">{children}</div>
        </main>

        {/* Right Panel Placeholder */}
        <div className="hidden xl:flex xl:w-[350px] flex-col gap-6 p-6 fixed right-0 h-screen overflow-y-auto bg-gray-50/50">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="font-bold text-gray-900">Demo Activity</h3>
                <div className="mt-4 space-y-4">
                    <div className="flex gap-3">
                        <div className="h-2 w-2 mt-2 rounded-full bg-green-500"></div>
                        <p className="text-sm text-gray-600"><strong>System</strong> parsed 3 resumes automatically.</p>
                    </div>
                     <div className="flex gap-3">
                        <div className="h-2 w-2 mt-2 rounded-full bg-blue-500"></div>
                        <p className="text-sm text-gray-600"><strong>Alice Smith</strong> applied for Senior Product Designer.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
