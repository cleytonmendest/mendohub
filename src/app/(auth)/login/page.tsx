/**
 * Login Page
 *
 * Página de login do MendoHub.
 * Redireciona automaticamente se já estiver autenticado (via middleware).
 */

import { LoginForm } from './login-form';

export const metadata = {
  title: 'Login - MendoHub',
  description: 'Faça login na plataforma MendoHub',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">MendoHub</h1>
          <p className="mt-2 text-gray-600">
            Faça login para acessar a plataforma
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
