import { Sidebar } from '@/components/dashboard/Sidebar';
import { RightPanel } from '@/components/dashboard/RightPanel';

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
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-md">
            <h1 className="text-xl font-bold text-gray-900">Home</h1>
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
