import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            Sistema de Badges
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Gerencie seus badges e acompanhe seu progresso
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 bg-white rounded-xl shadow-lg dark:bg-gray-800 transition-all hover:shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Meus Badges</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Visualize os badges conquistados e acompanhe seu progresso em novas conquistas.
            </p>
            <Link 
              href="/badges" 
              className="inline-flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Ver badges <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-lg dark:bg-gray-800 transition-all hover:shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Ranking</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Compare seu desempenho com outros usuários e veja sua posição no ranking.
            </p>
            <Link 
              href="/ranking" 
              className="inline-flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Ver ranking <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-lg dark:bg-gray-800 transition-all hover:shadow-xl md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Administração</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Acesse as funcionalidades administrativas do sistema de badges.
            </p>
            <Link 
              href="/admin/rules" 
              className="inline-flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Acessar administração <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Versão 1.0.0 • Desenvolvido com Next.js e Tailwind CSS
        </div>
      </div>
    </main>
  )
}