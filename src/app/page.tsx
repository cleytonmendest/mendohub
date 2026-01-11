export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold text-gray-900">
          MendoHub
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          WhatsApp Business automation SaaS platform with integrated AI
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
            ✓ Estrutura corrigida
          </div>
          <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
            Next.js 16.1.1
          </div>
          <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-medium">
            MVP Phase 1
          </div>
        </div>
      </div>
    </div>
  );
}
