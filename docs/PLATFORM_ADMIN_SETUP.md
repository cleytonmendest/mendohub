# Platform Admin Setup - MendoHub

Como configurar administradores da plataforma MendoHub.

---

## 🎯 Diferença: Platform Admin vs Organization Admin

### Platform Admin (você, Cleyton)
- ✅ Acessa **TODAS** as organizações
- ✅ Pode criar/editar/suspender qualquer organização
- ✅ Vê billing e usage de todos os clientes
- ✅ Gerencia outros platform admins
- ✅ Acessa admin dashboard (`/admin/*`)
- ❌ **NÃO** é membro de nenhuma organização cliente

### Organization Admin (cliente)
- ✅ Acessa apenas **SUA** organização
- ✅ Gerencia membros da equipe (agents)
- ✅ Configura WhatsApp, templates, workflows
- ✅ Vê inbox e conversas
- ❌ **NÃO** vê outras organizações
- ✅ Acessa dashboard cliente (`/[org]/*`)

---

## 🚀 Como Adicionar o Primeiro Platform Admin (Você)

### Passo 1: Criar conta no Supabase Auth

```bash
# Acesse sua aplicação localmente
http://localhost:3000/admin/login

# OU use o Supabase Studio
http://localhost:54323
```

Crie uma conta via interface (email + senha).

### Passo 2: Pegar seu User ID

**Via Supabase Studio:**
```sql
-- Execute no SQL Editor do Supabase Studio
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;
```

Anote o `id` (UUID).

### Passo 3: Inserir como Platform Admin

```sql
-- Execute no SQL Editor
INSERT INTO platform_admins (id, full_name, email, role)
VALUES (
  'seu-uuid-aqui',  -- Substitua pelo UUID do passo anterior
  'Cleyton Mendes',
  'seu-email@example.com',
  'super_admin'
);
```

### Passo 4: Verificar

```sql
SELECT * FROM platform_admins WHERE email = 'seu-email@example.com';
```

Deve retornar:
```
id                  | full_name       | email             | role        | is_active
--------------------|-----------------|-------------------|-------------|----------
seu-uuid-aqui       | Cleyton Mendes  | seu@email.com     | super_admin | true
```

---

## 👥 Como Adicionar Outros Platform Admins

### Via SQL (Temporário)

```sql
-- 1. Crie uma conta via Supabase Auth primeiro
-- 2. Pegue o user ID
SELECT id FROM auth.users WHERE email = 'colaborador@example.com';

-- 3. Insira como platform admin
INSERT INTO platform_admins (id, full_name, email, role, created_by)
VALUES (
  'uuid-do-colaborador',
  'Nome do Colaborador',
  'colaborador@example.com',
  'admin',  -- ou 'support'
  'seu-uuid-aqui'  -- seu ID como criador
);
```

### Via Interface (Futuro - Fase 3)

Quando tiver o Admin Dashboard pronto:
1. Acesse `/admin/platform-admins`
2. Clique "Add Admin"
3. Preencha email, nome, role
4. Sistema cria convite via Supabase Auth
5. Colaborador recebe email e define senha

---

## 🔐 Roles de Platform Admin

| Role | Descrição | Permissões |
|------|-----------|------------|
| `super_admin` | Você (owner) | - Ver/editar TUDO<br>- Criar outros admins<br>- Deletar admins |
| `admin` | Colaborador total | - Ver/editar organizações<br>- Ver logs e billing<br>- **NÃO** pode criar admins |
| `support` | Suporte/View-only | - Apenas visualização<br>- Impersonation de clientes<br>- **NÃO** pode editar |

---

## 🛡️ Segurança via RLS

### Platform Admins podem ver TUDO

As RLS policies garantem que platform admins têm acesso total:

```sql
-- Platform admins veem TODAS as organizations
CREATE POLICY "Platform admins can view all organizations"
  ON organizations FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM platform_admins WHERE is_active = true
    )
  );

-- Platform admins podem gerenciar TODAS as organizations
CREATE POLICY "Platform admins can manage all organizations"
  ON organizations FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM platform_admins
      WHERE role IN ('super_admin', 'admin') AND is_active = true
    )
  );
```

### Organization Users NÃO veem outras orgs

```sql
-- Users só veem SUA organização
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid()
    )
  );
```

---

## 🔄 Como Funciona na Aplicação

### Middleware de Autenticação

```typescript
// lib/middleware/require-platform-admin.ts
export async function requirePlatformAdmin() {
  const supabase = await createClient();

  // 1. Pegar usuário atual
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 2. Verificar se é platform admin
  const { data: platformAdmin } = await supabase
    .from('platform_admins')
    .select('*')
    .eq('id', user.id)
    .eq('is_active', true)
    .single();

  if (!platformAdmin) {
    redirect('/unauthorized'); // Não é platform admin
  }

  return platformAdmin;
}
```

### Uso em Admin Dashboard

```typescript
// app/admin/dashboard/page.tsx
export default async function AdminDashboardPage() {
  // Verifica se é platform admin
  const admin = await requirePlatformAdmin();

  // Admin pode ver TODAS as organizações
  const orgs = await getAllOrganizations(); // sem filtro por org

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {admin.full_name}</p>
      <OrganizationList organizations={orgs} />
    </div>
  );
}
```

### Impersonation (Login como Cliente)

```typescript
// app/admin/organizations/[id]/impersonate/route.ts
export async function POST(req: Request, { params }: { params: { id: string } }) {
  // 1. Verificar se é platform admin
  const admin = await requirePlatformAdmin();

  // 2. Pegar owner da organização
  const owner = await getUserByOrgAndRole(params.id, 'owner');

  // 3. Criar session temporária como owner
  // (implementar lógica de impersonation)

  // 4. Redirecionar para dashboard da org
  redirect(`/${org.slug}/dashboard?impersonated=true`);
}
```

---

## 📝 Checklist de Setup

### Primeira Vez (Agora)
- [ ] Criar conta via Supabase Auth
- [ ] Pegar seu user ID de `auth.users`
- [ ] Inserir em `platform_admins` com role `super_admin`
- [ ] Testar login no admin dashboard

### Adicionar Colaborador
- [ ] Colaborador cria conta via Supabase Auth
- [ ] Pegar user ID do colaborador
- [ ] Inserir em `platform_admins` com role apropriado
- [ ] Notificar colaborador que já pode acessar

### Futuro (Fase 3)
- [ ] Interface de gestão de admins (`/admin/platform-admins`)
- [ ] Sistema de convites
- [ ] Audit log de ações de admins
- [ ] Permissões granulares

---

## 🚨 Troubleshooting

### "Unauthorized" ao acessar `/admin`

**Causa**: Você não está em `platform_admins`

**Solução**:
```sql
-- Verificar se você está na tabela
SELECT * FROM platform_admins WHERE email = 'seu@email.com';

-- Se não estiver, adicione
INSERT INTO platform_admins (id, full_name, email, role)
VALUES ('seu-uuid', 'Seu Nome', 'seu@email.com', 'super_admin');
```

### Platform Admin vê "No organizations"

**Causa**: RLS policy não está aplicada corretamente

**Solução**:
```sql
-- Verificar policies
SELECT * FROM pg_policies WHERE tablename = 'organizations';

-- Recriar policies se necessário
DROP POLICY IF EXISTS "Platform admins can view all organizations" ON organizations;
CREATE POLICY "Platform admins can view all organizations"
  ON organizations FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM platform_admins WHERE is_active = true
    )
  );
```

### Não consegue adicionar outro admin

**Causa**: Você não é `super_admin`

**Solução**:
```sql
-- Verificar seu role
SELECT role FROM platform_admins WHERE id = auth.uid();

-- Se não for super_admin, atualize
UPDATE platform_admins SET role = 'super_admin' WHERE email = 'seu@email.com';
```

---

## 🔒 Segurança - Boas Práticas

1. **Nunca compartilhe credenciais** de super_admin
2. **Use `admin` role** para colaboradores (não super_admin)
3. **Audit log** todas as ações de platform admins
4. **Revogue acesso** imediatamente ao desligar colaborador:
   ```sql
   UPDATE platform_admins SET is_active = false WHERE email = 'ex-colaborador@example.com';
   ```
5. **2FA recomendado** (via Supabase Auth) para platform admins

---

**Última atualização**: Janeiro 2025
**Responsável**: Cleyton Mendes
