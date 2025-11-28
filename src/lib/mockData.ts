import { User, Condominio, Unidade, Ocorrencia, Espaco, Reserva, Comunicado, TransacaoFinanceira, Boleto } from '../types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao@sindico.com',
    telefone: '(11) 98765-4321',
    role: 'sindico',
    id_condominio: 1,
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria@morador.com',
    telefone: '(11) 98765-1234',
    role: 'morador',
    id_condominio: 1,
    id_unidade: 1,
  },
];

// Mock Condomínios
export const mockCondominios: Condominio[] = [
  {
    id: 1,
    nome: 'Residencial Parque das Flores',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua das Palmeiras, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
  },
];

// Mock Unidades
export const mockUnidades: Unidade[] = [
  { id: 1, id_condominio: 1, bloco: 'A', numero: '101', andar: 1 },
  { id: 2, id_condominio: 1, bloco: 'A', numero: '102', andar: 1 },
  { id: 3, id_condominio: 1, bloco: 'A', numero: '201', andar: 2 },
  { id: 4, id_condominio: 1, bloco: 'B', numero: '101', andar: 1 },
  { id: 5, id_condominio: 1, bloco: 'B', numero: '102', andar: 1 },
];

// Mock Ocorrências
export const mockOcorrencias: Ocorrencia[] = [
  {
    id: 1,
    id_usuario: 2,
    id_condominio: 1,
    titulo: 'Vazamento na área comum',
    descricao: 'Há um vazamento no corredor do 2º andar que precisa de atenção urgente.',
    status: 'pendente',
    data_registro: '2025-10-08T10:30:00',
    usuario_nome: 'Maria Santos',
  },
  {
    id: 2,
    id_usuario: 2,
    id_condominio: 1,
    titulo: 'Lâmpada queimada no estacionamento',
    descricao: 'A lâmpada próxima à vaga 15 está queimada.',
    status: 'em_andamento',
    data_registro: '2025-10-07T14:20:00',
    usuario_nome: 'Maria Santos',
  },
  {
    id: 3,
    id_usuario: 2,
    id_condominio: 1,
    titulo: 'Barulho excessivo',
    descricao: 'Apartamento 302 fazendo barulho após 22h.',
    status: 'resolvida',
    data_registro: '2025-10-05T22:45:00',
    data_resolucao: '2025-10-06T09:00:00',
    usuario_nome: 'Carlos Oliveira',
  },
];

// Mock Espaços
export const mockEspacos: Espaco[] = [
  { id: 1, id_condominio: 1, nome: 'Salão de Festas', capacidade: 50, ativo: true },
  { id: 2, id_condominio: 1, nome: 'Churrasqueira', capacidade: 20, ativo: true },
  { id: 3, id_condominio: 1, nome: 'Quadra Poliesportiva', capacidade: 30, ativo: true },
  { id: 4, id_condominio: 1, nome: 'Piscina', capacidade: 40, ativo: true },
];

// Mock Reservas
export const mockReservas: Reserva[] = [
  {
    id: 1,
    id_espaco: 1,
    id_usuario: 2,
    data_inicio: '2025-10-15T14:00:00',
    data_fim: '2025-10-15T22:00:00',
    status: 'confirmada',
    espaco_nome: 'Salão de Festas',
    usuario_nome: 'Maria Santos',
  },
  {
    id: 2,
    id_espaco: 2,
    id_usuario: 2,
    data_inicio: '2025-10-20T12:00:00',
    data_fim: '2025-10-20T16:00:00',
    status: 'pendente',
    espaco_nome: 'Churrasqueira',
    usuario_nome: 'Pedro Costa',
  },
];

// Mock Comunicados
export const mockComunicados: Comunicado[] = [
  {
    id: 1,
    id_condominio: 1,
    id_usuario: 1,
    titulo: 'Manutenção na Piscina',
    mensagem: 'Informamos que a piscina ficará fechada nos dias 12 e 13/10 para manutenção preventiva.',
    enviar_para_todos: true,
    data_envio: '2025-10-08T09:00:00',
    usuario_nome: 'João Silva',
  },
  {
    id: 2,
    id_condominio: 1,
    id_usuario: 1,
    titulo: 'Assembleia Geral',
    mensagem: 'Fica convocada Assembleia Geral Ordinária para o dia 25/10 às 19h no salão de festas.',
    enviar_para_todos: true,
    data_envio: '2025-10-07T15:30:00',
    usuario_nome: 'João Silva',
  },
  {
    id: 3,
    id_condominio: 1,
    id_usuario: 1,
    titulo: 'Coleta Seletiva',
    mensagem: 'A partir de novembro, teremos coleta seletiva às terças e quintas-feiras.',
    enviar_para_todos: true,
    data_envio: '2025-10-06T11:00:00',
    usuario_nome: 'João Silva',
  },
];

// Mock Transações Financeiras
export const mockTransacoes: TransacaoFinanceira[] = [
  {
    id: 1,
    id_condominio: 1,
    tipo: 'receita',
    categoria: 'Taxa Condominial',
    descricao: 'Recebimento taxas outubro/2025',
    valor: 25000.00,
    data_transacao: '2025-10-05',
  },
  {
    id: 2,
    id_condominio: 1,
    tipo: 'despesa',
    categoria: 'Manutenção',
    descricao: 'Reparo bomba piscina',
    valor: 1500.00,
    data_transacao: '2025-10-04',
  },
  {
    id: 3,
    id_condominio: 1,
    tipo: 'despesa',
    categoria: 'Limpeza',
    descricao: 'Serviço de limpeza mensal',
    valor: 3200.00,
    data_transacao: '2025-10-03',
  },
  {
    id: 4,
    id_condominio: 1,
    tipo: 'despesa',
    categoria: 'Segurança',
    descricao: 'Salário porteiros',
    valor: 8500.00,
    data_transacao: '2025-10-01',
  },
  {
    id: 5,
    id_condominio: 1,
    tipo: 'receita',
    categoria: 'Multa',
    descricao: 'Multa atraso unidade 201',
    valor: 150.00,
    data_transacao: '2025-10-02',
  },
];

// Mock Boletos
export const mockBoletos: Boleto[] = [
  {
    id: 1,
    id_unidade: 1,
    id_condominio: 1,
    valor: 500.00,
    data_vencimento: '2025-10-10',
    codigo_barras: '23791234500000050000123456789012345678901234',
    status: 'pago',
    data_pagamento: '2025-10-08',
    valor_pago: 500.00,
    unidade_numero: 'A-101',
  },
  {
    id: 2,
    id_unidade: 2,
    id_condominio: 1,
    valor: 500.00,
    data_vencimento: '2025-10-10',
    codigo_barras: '23791234500000050000123456789012345678901235',
    status: 'emitido',
    unidade_numero: 'A-102',
  },
  {
    id: 3,
    id_unidade: 3,
    id_condominio: 1,
    valor: 500.00,
    data_vencimento: '2025-10-10',
    codigo_barras: '23791234500000050000123456789012345678901236',
    status: 'vencido',
    unidade_numero: 'A-201',
  },
];
