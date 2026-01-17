/**
 * Next.js Middleware
 *
 * Executa antes de cada request para:
 * 1. Refresh automático de sessão do Supabase
 * 2. Proteção de rotas (redirect se não autenticado)
 * 3. Verificação de permissões (platform admin, organization access)
 *
 * IMPORTANTE:
 * - Executa no Edge Runtime (limitações de Node.js)
 * - Mantém sessão atualizada automaticamente
 * - RESPEITA RLS (não usa admin client desnecessariamente)
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session se necessário
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Lazy evaluation: só busca platform_admin quando necessário
  let platformAdmin: { id: string } | null | undefined = undefined;

  const getPlatformAdmin = async () => {
    if (platformAdmin === undefined) {
      const { data } = await supabase
        .from('platform_admins')
        .select('id')
        .eq('id', user?.id)
        .eq('is_active', true)
        .single();
      platformAdmin = data;
    }
    return platformAdmin;
  };

  // Rotas públicas (não precisam de autenticação)
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Se está tentando acessar rota pública e está autenticado, redireciona para dashboard
  if (isPublicRoute && user) {
    // Lazy: só busca se usuário está autenticado em rota pública
    const admin = await getPlatformAdmin();

    if (admin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Senão, redireciona para dashboard da organização do usuário
    // RLS agora funciona sem recursão (usa public.user_organization_id())
    const { data: userData } = await supabase
      .from('users')
      .select('organization:organizations(slug)')
      .eq('id', user.id)
      .single();

    if (userData?.organization) {
      const org = userData.organization as any;
      const orgSlug = org?.slug;
      if (orgSlug) {
        return NextResponse.redirect(
          new URL(`/${orgSlug}/dashboard`, request.url)
        );
      }
    }
  }

  // Proteger rotas /admin/*
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Lazy: só busca se está acessando /admin/*
    const admin = await getPlatformAdmin();

    if (!admin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Return early para evitar que o bloco de org routes pegue /admin/*
    return supabaseResponse;
  }

  // Proteger rotas /[org]/* (dashboard de organizações)
  // Exemplo: /acme/dashboard, /acme/inbox, etc.
  const orgRouteMatch = pathname.match(/^\/([^\/]+)\/(dashboard|inbox|templates|workflows|team|analytics|settings)/);

  if (orgRouteMatch) {
    const orgSlug = orgRouteMatch[1];

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Lazy: só busca platform admin se for verificar permissões de org
    const admin = await getPlatformAdmin();

    // Platform admins podem acessar qualquer organização
    if (admin) {
      return supabaseResponse;
    }

    // Verificar se o usuário tem acesso a esta organização
    // RLS funciona corretamente (usa public.user_organization_id())
    const { data: userData } = await supabase
      .from('users')
      .select('organization:organizations(slug)')
      .eq('id', user.id)
      .single();

    const org = userData?.organization as any;
    const userOrgSlug = org?.slug || null;

    if (userOrgSlug !== orgSlug) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
