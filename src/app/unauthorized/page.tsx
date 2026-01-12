/**
 * Unauthorized Page
 *
 * Exibida quando o usuário tenta acessar um recurso sem permissão.
 */

import Link from 'next/link';
import { logout } from '@/app/(auth)/login/actions';

export const metadata = {
  title: 'Acesso Negado - MendoHub',
  description: 'Você não tem permissão para acessar este recurso',
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 text-center shadow-lg">
        <div>
          <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Acesso Negado
          </h1>

          <p className="mt-2 text-gray-600">
            Você não tem permissão para acessar este recurso.
          </p>

          <p className="mt-4 text-sm text-gray-500">
            Se você acredita que isso é um erro, entre em contato com o
            administrador da plataforma.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <Link
            href="/"
            className="block w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Voltar ao Início
          </Link>

          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Fazer Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
