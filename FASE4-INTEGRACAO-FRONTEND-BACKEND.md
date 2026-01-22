# Fase 4: Integração Frontend ↔ Backend

**Status**: Em Progresso (Fase 4.1 Completa)

## Contexto

A **Fase 3** implementou toda a infraestrutura backend:
- ✅ APIs REST (`/api/[org]/conversations`, `/api/[org]/conversations/[id]/messages`)
- ✅ Repositories (interface + implementação Supabase)
- ✅ RLS configurado para multi-tenancy
- ✅ WhatsApp API service

A **Fase 4** conecta o frontend (que usa `mock-data.ts`) com as APIs reais.

---

## Roadmap - Subfases

### **Fase 4.1: Buscar Conversas Reais** ✅ COMPLETA
**Objetivo**: Substituir `mockConversations` por dados reais da API.

**Escopo**:
- GET `/api/[org]/conversations`
- Hook SWR para data fetching
- Loading/error states
- Polling automático (3s)

**Arquivos Impactados**:
- `src/lib/utils/fetcher.ts` (NOVO)
- `src/hooks/use-conversations.ts` (NOVO)
- `src/app/(dashboard)/[org]/inbox/types.ts` (NOVO)
- `src/app/(dashboard)/[org]/inbox/page.tsx` (ATUALIZADO)

---

### **Fase 4.2: Buscar Mensagens Reais** ⏳ PRÓXIMA
**Objetivo**: Substituir `mockMessages` por dados reais da API.

**Escopo**:
- GET `/api/[org]/conversations/[id]/messages`
- Hook `useMessages(orgId, conversationId)`
- Carregar mensagens quando conversa é selecionada
- Loading state para mensagens

**Arquivos a Criar/Atualizar**:
- `src/hooks/use-messages.ts` (NOVO)
- `src/app/(dashboard)/[org]/inbox/types.ts` (adicionar `toUiMessage`)
- `src/app/(dashboard)/[org]/inbox/page.tsx` (substituir `mockMessages`)
- `src/app/(dashboard)/[org]/inbox/components/message-area.tsx` (adicionar loading)

**Critérios de Sucesso**:
- Mensagens reais aparecem ao selecionar conversa
- Loading skeleton durante fetch
- Sem usar `mockMessages`

---

### **Fase 4.3: Enviar Mensagens** ⏳ PENDENTE
**Objetivo**: Implementar POST de mensagens para WhatsApp via API.

**Escopo**:
- POST `/api/[org]/conversations/[id]/messages`
- Hook `useSendMessage` com SWR mutation
- Optimistic UI update
- Integração com WhatsApp Business API

**Arquivos a Criar/Atualizar**:
- `src/hooks/use-send-message.ts` (NOVO)
- `src/app/(dashboard)/[org]/inbox/page.tsx` (substituir `handleSendMessage`)
- `src/app/(dashboard)/[org]/inbox/components/message-input.tsx` (loading durante envio)

**Critérios de Sucesso**:
- Mensagem aparece na UI imediatamente (optimistic update)
- POST real para API + WhatsApp
- Status de entrega (sent/delivered/read)
- Rollback se falhar

---

### **Fase 4.4: Loading & Error States Refinados** ⏳ PENDENTE
**Objetivo**: Melhorar UX com estados de carregamento e erro.

**Escopo**:
- Skeleton loaders para lista de conversas
- Skeleton loaders para mensagens
- Toast notifications para erros
- Retry automático em caso de falha
- Empty states (sem conversas, sem mensagens)

**Arquivos a Criar/Atualizar**:
- `src/app/(dashboard)/[org]/inbox/components/conversation-skeleton.tsx` (NOVO)
- `src/app/(dashboard)/[org]/inbox/components/message-skeleton.tsx` (NOVO)
- `src/app/(dashboard)/[org]/inbox/components/empty-state.tsx` (NOVO)
- `src/components/ui/toast.tsx` (usar shadcn/ui)

**Critérios de Sucesso**:
- Skeletons aparecem durante loading
- Toasts em erros de envio
- Empty states claros e úteis

---

### **Fase 4.5: Limpeza & Remover Mocks** ⏳ PENDENTE
**Objetivo**: Remover código temporário e mock data.

**Escopo**:
- Deletar `src/app/(dashboard)/[org]/inbox/mock-data.ts`
- Remover imports de mock data
- Limpar TODOs relacionados
- Atualizar comentários de código
- Documentar arquitetura final

**Arquivos a Deletar**:
- `src/app/(dashboard)/[org]/inbox/mock-data.ts`

**Critérios de Sucesso**:
- Zero referências a mock data
- Todos os dados vem da API
- TypeScript compila sem warnings

---

## Fase 4.1: Detalhamento ✅

### O Que Foi Implementado

#### 1. **Fetcher Helper** (`src/lib/utils/fetcher.ts`)
Utilitário para fazer requisições HTTP com SWR.

**Funcionalidades**:
- Parse automático de `ApiSuccess<T>` e `ApiError`
- Lança `FetchError` customizado com status code
- Suporte a GET e POST/PUT/PATCH
- Tratamento de erros JSON parse

**Uso**:
```typescript
const data = await fetcher<Conversation[]>('/api/org-slug/conversations');
```

---

#### 2. **Hook useConversations** (`src/hooks/use-conversations.ts`)
Hook SWR para buscar conversas de uma organização.

**Features**:
- Polling automático a cada 3s
- Revalidação on focus/reconnect
- Deduplicação de requests (2s)
- Filtros: `status`, `assignedTo`
- Conversão automática para formato UI (`toUiConversation`)

**Retorno**:
```typescript
{
  conversations: UiConversation[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => void; // Para revalidação manual
}
```

**Uso**:
```typescript
const { conversations, isLoading, isError } = useConversations('org-slug', {
  status: 'open',
  refreshInterval: 3000
});
```

---

#### 3. **Tipos UI** (`src/app/(dashboard)/[org]/inbox/types.ts`)
Tipos para compatibilidade entre mock data e dados reais do banco.

**Por quê?**
- Mock data usa `camelCase`: `customerName`, `lastMessageAt`
- Banco Supabase usa `snake_case`: `customer_name`, `last_message_at`
- Componentes UI já esperam `camelCase`

**Solução**:
- Interfaces `UiConversation` e `UiMessage` (camelCase)
- Função `toUiConversation(dbConv)` converte DB → UI
- Permite migração gradual sem quebrar componentes

**Exemplo**:
```typescript
// Banco (snake_case)
const dbConv: Conversation = {
  id: '123',
  customer_name: 'João',
  last_message_at: '2026-01-21T10:00:00Z',
  ...
};

// UI (camelCase)
const uiConv: UiConversation = toUiConversation(dbConv);
// {
//   id: '123',
//   customerName: 'João',
//   lastMessageAt: Date(2026-01-21T10:00:00Z),
//   ...
// }
```

---

#### 4. **Inbox Page Atualizado** (`src/app/(dashboard)/[org]/inbox/page.tsx`)

**Mudanças**:

**ANTES** (mock):
```typescript
const [conversations, setConversations] = useState(mockConversations);
```

**DEPOIS** (API real):
```typescript
const params = useParams<{ org: string }>();
const { conversations, isLoading, isError } = useConversations(params.org);
```

**Estados Adicionados**:
1. **Loading State**:
   - Spinner animado
   - Texto "Carregando conversas..."

2. **Error State**:
   - Ícone ⚠️
   - Mensagem de erro
   - Botão "Recarregar página"

3. **Success State**:
   - Renderiza conversas normalmente
   - Busca local ainda funciona (client-side)

**Comportamento**:
- Polling automático a cada 3s
- Conversas atualizam em tempo real
- Se Supabase cair → Error state
- Se sem conversas → Lista vazia (sem erro)

---

### Arquivos Criados

```
src/
├── lib/
│   └── utils/
│       └── fetcher.ts              ← NOVO: Helper para requests HTTP
├── hooks/
│   └── use-conversations.ts        ← NOVO: Hook SWR para conversas
└── app/
    └── (dashboard)/
        └── [org]/
            └── inbox/
                ├── types.ts        ← NOVO: Tipos UI + conversores
                └── page.tsx        ← ATUALIZADO: Usa API real
```

---

### Arquivos Modificados

#### `src/app/(dashboard)/[org]/inbox/page.tsx`
**Linhas alteradas**: ~50
**Principais mudanças**:
- Removido `useState` para conversas
- Adicionado `useParams` e `useConversations`
- Adicionado loading/error states
- Mantido `mockMessages` (será removido na 4.2)

---

### Dependências Adicionadas

```json
{
  "dependencies": {
    "swr": "^2.2.5"  // ~13KB - data fetching + cache
  }
}
```

**Por que SWR?**
- Simples e leve (vs React Query ~45KB)
- Polling automático built-in
- Revalidação inteligente
- Suficiente para MVP
- Fácil migração para React Query depois (se necessário)

---

## Próximos Passos

### Fase 4.2: Buscar Mensagens Reais

**Tarefas**:
1. Criar `src/hooks/use-messages.ts`
2. Adicionar `toUiMessage` em `types.ts`
3. Atualizar `page.tsx` para usar `useMessages`
4. Adicionar loading skeleton em `message-area.tsx`
5. Testar carregamento de mensagens

**Estimativa**: ~1-2h

---

## Critérios de Sucesso da Fase 4 Completa

Quando toda a Fase 4 estiver concluída:

- ✅ Zero uso de mock data
- ✅ Conversas vem do Supabase via API
- ✅ Mensagens vem do Supabase via API
- ✅ Envio de mensagens via WhatsApp API
- ✅ Loading states em todas as operações
- ✅ Error handling com recovery
- ✅ Optimistic updates em envio
- ✅ Polling automático (3s para conversas)
- ✅ TypeScript sem erros/warnings
- ✅ `mock-data.ts` deletado

---

## Notas Técnicas

### Por que Polling em vez de Realtime?

**Fase 4**: Polling a cada 3s (SWR)
- ✅ Simples de implementar
- ✅ Funciona com qualquer backend
- ✅ Suficiente para MVP
- ✅ Usa 1 request/3s por cliente

**Fase 6** (futura): Supabase Realtime (WebSocket)
- Adicionar quando: >50 clientes ativos simultâneos
- Economiza bandwidth
- Mensagens instantâneas (<100ms)

### Segurança

Todas as requests passam por:
1. **`withTenant` middleware**: Valida acesso à organização
2. **RLS Policies**: Garante isolamento multi-tenant no Supabase
3. **TypeScript strict**: Validação em tempo de compilação
4. **Zod schemas**: Validação em runtime (nas APIs)

### Performance

**Otimizações atuais**:
- SWR deduping (2s): Evita requests duplicados
- Cache automático do SWR
- Polling configurável (`refreshInterval`)

**Otimizações futuras** (quando necessário):
- Paginação (infinite scroll)
- Virtual scrolling para 1000+ conversas
- Realtime WebSocket
- Service Worker para offline

---

## Troubleshooting

### Erro: "conversations is undefined"
**Causa**: Hook não recebeu `orgId` ou API falhou
**Solução**: Verifique `params.org` e network tab

### Erro: 401/403 na API
**Causa**: Usuário não autenticado ou sem acesso à org
**Solução**: Verifique RLS policies e session do Supabase

### Conversas não aparecem
**Causa**: Tabela vazia ou RLS bloqueando
**Solução**:
1. Verifique se há dados em `conversations` table
2. Teste RLS policies manualmente no Supabase Studio
3. Verifique logs do servidor (`npm run dev`)

### Polling não funciona
**Causa**: Tab em background ou `refreshInterval: 0`
**Solução**: SWR pausa polling em tabs inativas (comportamento normal)

---

**Última atualização**: 2026-01-21
**Responsável**: Claude Code
**Próxima fase**: 4.2 - Buscar Mensagens Reais
