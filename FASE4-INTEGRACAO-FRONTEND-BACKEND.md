# Fase 4: Integração Frontend ↔ Backend

**Status**: Em Progresso (Fase 4.1 Completa + Refatoração KISS)

## Contexto

A **Fase 3** implementou toda a infraestrutura backend:
- ✅ APIs REST (`/api/[org]/conversations`, `/api/[org]/conversations/[id]/messages`)
- ✅ Repositories (interface + implementação Supabase)
- ✅ RLS configurado para multi-tenancy
- ✅ WhatsApp API service

A **Fase 4** conecta o frontend (que usa `mock-data.ts`) com as APIs reais.

---

## Princípios Aplicados

Esta fase segue os princípios do projeto definidos no `CLAUDE.md`:

- **KISS**: Usar tipos do Supabase diretamente, sem camadas de conversão
- **DRY**: Uma única definição de tipos (repository)
- **Pain-Driven Complexity**: Sem abstrações prematuras

### Decisão Arquitetural: snake_case na UI

**Problema**: Supabase retorna `snake_case`, componentes React tradicionalmente usam `camelCase`.

**Decisão**: Usar `snake_case` diretamente nos componentes.

**Justificativa**:
- Zero código de conversão
- Uma única fonte de verdade para tipos
- TypeScript garante type-safety independente do naming
- É o padrão usado pelo próprio Supabase Dashboard

**Exemplo**:
```tsx
// Componente usa tipos do Supabase diretamente
<h3>{conversation.customer_name}</h3>
<span>{conversation.last_message_at}</span>
```

---

## Roadmap - Subfases

### **Fase 4.1: Buscar Conversas Reais** ✅ COMPLETA

**Objetivo**: Substituir `mockConversations` por dados reais da API.

**Escopo**:
- GET `/api/[org]/conversations`
- Hook SWR para data fetching
- Loading/error states
- Polling automático (3s)

**Arquivos Criados**:
- `src/lib/utils/fetcher.ts` - Helper para requests HTTP
- `src/hooks/use-conversations.ts` - Hook SWR para conversas

**Arquivos Modificados**:
- `src/app/(dashboard)/[org]/inbox/page.tsx` - Usa API real
- `src/app/(dashboard)/[org]/inbox/components/conversation-list.tsx` - snake_case
- `src/app/(dashboard)/[org]/inbox/components/message-area.tsx` - snake_case
- `src/app/(dashboard)/[org]/inbox/components/contact-info-popover.tsx` - snake_case

**Refatoração KISS** (aplicada após implementação inicial):
- ❌ Removido `types.ts` (tipos duplicados)
- ❌ Removido `toUiConversation()` (conversão desnecessária)
- ✅ Componentes usam `Conversation` do repository diretamente

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
- `src/app/(dashboard)/[org]/inbox/page.tsx` (substituir `mockMessages`)
- `src/app/(dashboard)/[org]/inbox/components/message-area.tsx` (loading state)
- `src/app/(dashboard)/[org]/inbox/components/message-bubble.tsx` (usar tipo do repository)

**Abordagem KISS**:
- Usar tipo `Message` do repository diretamente
- Sem funções de conversão
- Componentes usam `message.is_ai_generated`, `message.created_at`, etc.

**Critérios de Sucesso**:
- Mensagens reais aparecem ao selecionar conversa
- Loading state durante fetch
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

**Arquivos a Deletar**:
- `src/app/(dashboard)/[org]/inbox/mock-data.ts`

**Critérios de Sucesso**:
- Zero referências a mock data
- Todos os dados vem da API
- TypeScript compila sem warnings

---

## Fase 4.1: Detalhamento ✅

### Arquitetura Final

```
src/
├── lib/
│   ├── db/
│   │   └── repositories/
│   │       └── conversation.ts    ← Tipos oficiais (snake_case)
│   └── utils/
│       └── fetcher.ts             ← Helper para requests HTTP
├── hooks/
│   └── use-conversations.ts       ← Hook SWR (retorna tipo do repository)
└── app/
    └── (dashboard)/
        └── [org]/
            └── inbox/
                ├── mock-data.ts   ← Temporário (Message apenas)
                ├── page.tsx       ← Usa Conversation do repository
                └── components/
                    ├── conversation-list.tsx  ← snake_case
                    ├── message-area.tsx       ← snake_case
                    └── contact-info-popover.tsx ← snake_case
```

### Fetcher Helper (`src/lib/utils/fetcher.ts`)

Utilitário para fazer requisições HTTP com SWR.

**Funcionalidades**:
- Parse automático de `ApiSuccess<T>` e `ApiError`
- Lança `FetchError` customizado com status code
- Suporte a GET e POST/PUT/PATCH

**Uso**:
```typescript
const data = await fetcher<Conversation[]>('/api/org-slug/conversations');
```

---

### Hook useConversations (`src/hooks/use-conversations.ts`)

Hook SWR para buscar conversas de uma organização.

**Features**:
- Polling automático a cada 3s
- Revalidação on focus/reconnect
- Deduplicação de requests (2s)
- Filtros: `status`, `assignedTo`
- Retorna tipo `Conversation` do repository diretamente

**Retorno**:
```typescript
{
  conversations: Conversation[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => void;
}
```

**Uso**:
```typescript
const { conversations, isLoading, isError } = useConversations('org-slug', {
  status: 'open',
  refreshInterval: 3000
});

// Componente usa snake_case
{conversations?.map(conv => (
  <div key={conv.id}>
    <h3>{conv.customer_name}</h3>
    <p>{conv.last_message_content}</p>
  </div>
))}
```

---

### Dependências

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

---

## Próximos Passos

### Fase 4.2: Buscar Mensagens Reais

**Tarefas**:
1. Criar `src/hooks/use-messages.ts` (similar ao `useConversations`)
2. Atualizar `page.tsx` para usar `useMessages`
3. Atualizar `message-bubble.tsx` para usar tipo `Message` do repository
4. Adicionar loading state em `message-area.tsx`
5. Testar carregamento de mensagens

**Abordagem**:
- Mesmo padrão do `useConversations`
- Sem camada de conversão
- Componentes usam `snake_case` diretamente

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
- ✅ Tipos usados diretamente do repository (KISS)

---

## Notas Técnicas

### Por que Polling em vez de Realtime?

**Fase 4**: Polling a cada 3s (SWR)
- ✅ Simples de implementar
- ✅ Funciona com qualquer backend
- ✅ Suficiente para MVP

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

**Última atualização**: 2026-01-22
**Responsável**: Claude Code
**Próxima fase**: 4.2 - Buscar Mensagens Reais
