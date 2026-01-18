/**
 * Mock Data para Inbox
 *
 * Dados temporários para desenvolvimento do front
 * Será substituído por dados reais do Supabase
 */

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  direction: 'inbound' | 'outbound';
  timestamp: Date;
  isAiGenerated: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerProfilePicUrl: string | null;
  lastMessageContent: string;
  lastMessageAt: Date;
  lastMessageDirection: 'inbound' | 'outbound';
  unreadCount: number;
  status: 'open' | 'resolved';
}

export const mockConversations: Conversation[] = [
  {
    id: '1',
    customerName: 'João Silva',
    customerPhone: '+55 11 98765-4321',
    customerProfilePicUrl: null,
    lastMessageContent: 'Para trabalho, principalmente programação',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 5),
    lastMessageDirection: 'inbound',
    unreadCount: 1,
    status: 'open',
  },
  {
    id: '2',
    customerName: 'Maria Santos',
    customerPhone: '+55 11 91234-5678',
    customerProfilePicUrl: null,
    lastMessageContent: 'Obrigada pelo atendimento!',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 30),
    lastMessageDirection: 'inbound',
    unreadCount: 0,
    status: 'open',
  },
  {
    id: '3',
    customerName: 'Pedro Costa',
    customerPhone: '+55 11 99999-8888',
    customerProfilePicUrl: null,
    lastMessageContent: 'Qual o prazo de entrega?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    lastMessageDirection: 'inbound',
    unreadCount: 1,
    status: 'open',
  },
  {
    id: '4',
    customerName: 'Ana Oliveira',
    customerPhone: '+55 11 97777-6666',
    customerProfilePicUrl: null,
    lastMessageContent: 'Perfeito, vou aguardar!',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    lastMessageDirection: 'outbound',
    unreadCount: 0,
    status: 'open',
  },
];

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1-1',
      conversationId: '1',
      content: 'Olá! Gostaria de saber mais sobre os produtos',
      direction: 'inbound',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      isAiGenerated: false,
    },
    {
      id: '1-2',
      conversationId: '1',
      content: 'Olá João! Temos diversos produtos disponíveis. Você está procurando algo específico?',
      direction: 'outbound',
      timestamp: new Date(Date.now() - 1000 * 60 * 9),
      isAiGenerated: true,
      status: 'read',
    },
    {
      id: '1-3',
      conversationId: '1',
      content: 'Sim, estou procurando por notebooks',
      direction: 'inbound',
      timestamp: new Date(Date.now() - 1000 * 60 * 8),
      isAiGenerated: false,
    },
    {
      id: '1-4',
      conversationId: '1',
      content: 'Perfeito! Temos notebooks Dell, Lenovo e HP. Qual seria o uso principal? Trabalho, estudos ou jogos?',
      direction: 'outbound',
      timestamp: new Date(Date.now() - 1000 * 60 * 7),
      isAiGenerated: false,
      status: 'read',
    },
    {
      id: '1-5',
      conversationId: '1',
      content: 'Para trabalho, principalmente programação',
      direction: 'inbound',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isAiGenerated: false,
    },
  ],
  '2': [
    {
      id: '2-1',
      conversationId: '2',
      content: 'Boa tarde! Vi que vocês fazem entregas',
      direction: 'inbound',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isAiGenerated: false,
    },
    {
      id: '2-2',
      conversationId: '2',
      content: 'Boa tarde Maria! Sim, fazemos entregas para toda a região. Qual o seu endereço?',
      direction: 'outbound',
      timestamp: new Date(Date.now() - 1000 * 60 * 50),
      isAiGenerated: false,
      status: 'read',
    },
    {
      id: '2-3',
      conversationId: '2',
      content: 'Rua das Flores, 123 - Centro',
      direction: 'inbound',
      timestamp: new Date(Date.now() - 1000 * 60 * 40),
      isAiGenerated: false,
    },
    {
      id: '2-4',
      conversationId: '2',
      content: 'Ótimo! Entregamos na sua região. O frete fica em R$ 15,00 e o prazo é de 2 dias úteis.',
      direction: 'outbound',
      timestamp: new Date(Date.now() - 1000 * 60 * 35),
      isAiGenerated: false,
      status: 'read',
    },
    {
      id: '2-5',
      conversationId: '2',
      content: 'Obrigada pelo atendimento!',
      direction: 'inbound',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isAiGenerated: false,
    },
  ],
  '3': [
    {
      id: '3-1',
      conversationId: '3',
      content: 'Qual o prazo de entrega?',
      direction: 'inbound',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isAiGenerated: false,
    },
  ],
  '4': [
    {
      id: '4-1',
      conversationId: '4',
      content: 'Olá, gostaria de fazer um orçamento',
      direction: 'inbound',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      isAiGenerated: false,
    },
    {
      id: '4-2',
      conversationId: '4',
      content: 'Olá Ana! Claro, posso te ajudar. Qual produto você tem interesse?',
      direction: 'outbound',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5.5),
      isAiGenerated: false,
      status: 'delivered',
    },
    {
      id: '4-3',
      conversationId: '4',
      content: 'Notebook para estudos',
      direction: 'inbound',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5.3),
      isAiGenerated: false,
    },
    {
      id: '4-4',
      conversationId: '4',
      content: 'Temos ótimas opções! O modelo X está em promoção por R$ 2.500. Envio o link para você ver as especificações?',
      direction: 'outbound',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5.2),
      isAiGenerated: false,
      status: 'delivered',
    },
    {
      id: '4-5',
      conversationId: '4',
      content: 'Perfeito, vou aguardar!',
      direction: 'inbound',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      isAiGenerated: false,
    },
  ],
};
