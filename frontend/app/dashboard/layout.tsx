import { Sidebar } from '@/components/dashboard/Sidebar';
import { RightPanel } from '@/components/dashboard/RightPanel';
import Image from 'next/image';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-[1300px] justify-center">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center Content */}
        <main className="ml-[275px] flex min-w-0 flex-1 flex-col border-r border-gray-100 xl:mr-[350px]">
          <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-md">
             <div className="flex items-center gap-2">
                 <Image
                   src="/images/brand/Workera_Full_Icon.png"
                   alt="Workera"
                   width={100}
                   height={24}
                   className="h-6 w-auto object-contain"
                 />
             </div>
          </div>
          <div className="p-4">
            {children}
          </div>
        </main>

        {/* Right Sidebar */}
        <RightPanel />
      </div>
    </div>
  );
}
