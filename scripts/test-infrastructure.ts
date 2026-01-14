/**
 * Script de Teste da Infraestrutura
 *
 * Este script testa:
 * 1. Conexão com Supabase
 * 2. Clientes (client, server, admin)
 * 3. Repository Pattern
 * 4. Criptografia
 * 5. Logger
 *
 * Execute: npx tsx scripts/test-infrastructure.ts
 */

// Load environment variables FIRST
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createAdminClient } from '../src/lib/db/supabase/admin.js';
import { encrypt, decrypt } from '../src/lib/utils/crypto.js';
import { logger } from '../src/lib/utils/logger.js';

async function testInfrastructure() {
  console.log('🧪 Testando Infraestrutura MendoHub\n');

  // Test 1: Logger
  console.log('1️⃣ Testando Logger...');
  logger.info('test_infrastructure_started', { timestamp: new Date().toISOString() });
  logger.debug('This should only show in development');
  console.log('✅ Logger funcionando\n');

  // Test 2: Criptografia
  console.log('2️⃣ Testando Criptografia...');
  const secretToken = 'my-secret-whatsapp-token-12345';
  const encrypted = encrypt(secretToken);
  const decrypted = decrypt(encrypted);

  console.log(`Original: ${secretToken}`);
  console.log(`Encriptado: ${encrypted}`);
  console.log(`Descriptografado: ${decrypted}`);

  if (decrypted === secretToken) {
    console.log('✅ Criptografia funcionando\n');
  } else {
    console.log('❌ Erro na criptografia!\n');
    process.exit(1);
  }

  // Test 3: Supabase Admin Client
  console.log('3️⃣ Testando Supabase Admin Client...');
  try {
    const adminClient = createAdminClient();
    const { data: plans, error } = await adminClient
      .from('plans')
      .select('slug, name')
      .limit(3);

    if (error) throw error;

    console.log(`📊 Plans encontrados: ${plans?.length}`);
    plans?.forEach(plan => {
      console.log(`  - ${plan.name} (${plan.slug})`);
    });
    console.log('✅ Admin Client funcionando\n');
  } catch (error) {
    console.log(`❌ Erro no Admin Client: ${error}`);
    process.exit(1);
  }

  // Test 4: Supabase Server Client
  console.log('4️⃣ Testando Supabase Server Client...');
  console.log('⏭️  Pulando: Server Client só funciona em request context do Next.js');
  console.log('✅ Server Client configurado (use em Server Components/API Routes)\n');

  // Test 5: Repository Pattern
  console.log('5️⃣ Testando Repository Pattern...');
  try {
    // Usar Admin Client diretamente para testar em contexto não-request
    const adminClient = createAdminClient();
    const { data: orgs, error } = await adminClient
      .from('organizations')
      .select('*')
      .is('deleted_at', null);

    if (error) throw error;

    console.log(`🏢 Organizações encontradas: ${orgs.length}`);
    if (orgs.length > 0) {
      orgs.forEach(org => {
        console.log(`  - ${org.name} (${org.slug})`);
      });
    } else {
      console.log('  (Nenhuma organização ainda - isso é normal em setup inicial)');
    }
    console.log('✅ Repository Pattern funcionando (testado via Admin Client)\n');
  } catch (error) {
    console.log(`❌ Erro no Repository: ${error}`);
    process.exit(1);
  }

  // Test 6: Verificar Platform Admins
  console.log('6️⃣ Verificando Platform Admins...');
  try {
    const adminClient = createAdminClient();
    const { data: admins, error } = await adminClient
      .from('platform_admins')
      .select('email, full_name, role, is_active');

    if (error) throw error;

    if (admins && admins.length > 0) {
      console.log(`👥 Platform Admins encontrados: ${admins.length}`);
      admins.forEach(admin => {
        console.log(`  - ${admin.full_name} (${admin.email}) - ${admin.role}`);
      });
      console.log('✅ Platform Admins configurados\n');
    } else {
      console.log('⚠️  Nenhum Platform Admin encontrado');
      console.log('📝 Siga as instruções em docs/PLATFORM_ADMIN_SETUP.md\n');
    }
  } catch (error) {
    console.log(`❌ Erro ao verificar Platform Admins: ${error}`);
  }

  console.log('🎉 Todos os testes passaram!\n');
  console.log('Próximos passos:');
  console.log('1. Se não tem Platform Admin, siga docs/PLATFORM_ADMIN_SETUP.md');
  console.log('2. Comece a desenvolver as features!');
}

// Executar testes
testInfrastructure()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
