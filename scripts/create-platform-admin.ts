/**
 * Script para Criar Platform Admin
 *
 * Este script ajuda a criar o primeiro Platform Admin.
 *
 * IMPORTANTE: Execute este script DEPOIS de criar a conta no Supabase Auth
 *
 * Execute: npx tsx scripts/create-platform-admin.ts
 */

// Load environment variables FIRST
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createAdminClient } from '../src/lib/db/supabase/admin.js';
import { logger } from '../src/lib/utils/logger.js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createPlatformAdmin() {
  console.log('👤 Criar Platform Admin - MendoHub\n');

  // Verificar se já existem admins
  const adminClient = createAdminClient();
  const { data: existingAdmins } = await adminClient
    .from('platform_admins')
    .select('email')
    .limit(1);

  if (existingAdmins && existingAdmins.length > 0) {
    console.log('⚠️  Já existe pelo menos um Platform Admin no sistema.');
    const continueAnyway = await question('Deseja adicionar outro? (s/N): ');

    if (continueAnyway.toLowerCase() !== 's') {
      console.log('❌ Cancelado.');
      rl.close();
      process.exit(0);
    }
  }

  console.log('\n📋 Passo 1: Criar conta no Supabase Auth');
  console.log('Abra o Supabase Studio: http://127.0.0.1:54323');
  console.log('Vá em: Authentication > Users > Add User');
  console.log('Preencha email e senha, depois clique em "Create user"\n');

  const continueStep1 = await question('Já criou a conta? (s/N): ');
  if (continueStep1.toLowerCase() !== 's') {
    console.log('❌ Cancelado. Crie a conta primeiro e execute novamente.');
    rl.close();
    process.exit(0);
  }

  console.log('\n📋 Passo 2: Buscar User ID');
  console.log('Opção 1: Copie o ID do usuário na lista de Users no Studio');
  console.log('Opção 2: Execute este SQL no SQL Editor:');
  console.log('  SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;\n');

  const userId = await question('Cole o User ID aqui: ');

  if (!userId || userId.length !== 36) {
    console.log('❌ User ID inválido. Deve ser um UUID (36 caracteres).');
    rl.close();
    process.exit(1);
  }

  console.log('\n📋 Passo 3: Informações do Admin');

  const fullName = await question('Nome completo: ');
  const email = await question('Email: ');
  const role = await question('Role (super_admin/admin/support) [super_admin]: ') || 'super_admin';

  if (!['super_admin', 'admin', 'support'].includes(role)) {
    console.log('❌ Role inválido. Use: super_admin, admin ou support');
    rl.close();
    process.exit(1);
  }

  console.log('\n📝 Resumo:');
  console.log(`  ID: ${userId}`);
  console.log(`  Nome: ${fullName}`);
  console.log(`  Email: ${email}`);
  console.log(`  Role: ${role}\n`);

  const confirm = await question('Confirma a criação? (s/N): ');

  if (confirm.toLowerCase() !== 's') {
    console.log('❌ Cancelado.');
    rl.close();
    process.exit(0);
  }

  // Inserir na tabela platform_admins
  console.log('\n⏳ Criando Platform Admin...');

  try {
    const { data, error } = await adminClient
      .from('platform_admins')
      .insert({
        id: userId,
        full_name: fullName,
        email: email,
        role: role,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Platform Admin criado com sucesso!');
    console.log('\n📊 Dados:');
    console.log(JSON.stringify(data, null, 2));

    logger.info('platform_admin_created', {
      admin_id: userId,
      email: email,
      role: role,
    });

    console.log('\n🎉 Pronto! Você pode fazer login com essas credenciais.');
    console.log('\nPróximos passos:');
    console.log('1. Execute: npx tsx scripts/test-infrastructure.ts');
    console.log('2. Comece a desenvolver o admin dashboard!');

  } catch (error: any) {
    console.log(`\n❌ Erro ao criar Platform Admin: ${error.message}`);

    if (error.code === '23505') {
      console.log('💡 Este usuário já é um Platform Admin.');
    } else if (error.code === '23503') {
      console.log('💡 User ID não encontrado. Verifique se a conta foi criada no Auth.');
    }

    logger.error('platform_admin_creation_failed', {
      error: error.message,
      code: error.code,
    });

    rl.close();
    process.exit(1);
  }

  rl.close();
  process.exit(0);
}

// Executar
createPlatformAdmin().catch((error) => {
  console.error('💥 Erro fatal:', error);
  rl.close();
  process.exit(1);
});
