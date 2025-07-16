import { Settings } from '@/components/settings/Settings'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { QueryProvider } from '@/components/providers/QueryProvider'

export default function SettingsPage() {
  return (
    <QueryProvider>
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Header />
        
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-auto">
            <Settings />
          </main>
        </div>
      </div>
    </QueryProvider>
  )
} 