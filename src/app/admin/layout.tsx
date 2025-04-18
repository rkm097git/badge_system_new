import { ReactNode } from "react"
import Link from "next/link"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full">
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-10 w-full">
        <div className="container">
          <div className="flex flex-wrap items-center justify-between py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4 py-2">
              <Link 
                href="/admin/rules" 
                className="text-gray-900 dark:text-white font-semibold hover:text-blue-500 dark:hover:text-blue-400"
              >
                Lista de Regras
              </Link>
            </div>
            <Link 
              href="/" 
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 py-2"
            >
              Voltar para o portal
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full">
        {children}
      </main>
    </div>
  )
} 