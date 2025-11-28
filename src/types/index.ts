export type UserRole = 'morador' | 'sindico';

export interface User {
  id: string | number; // Aceitar ambos para compatibilidade
  nome: string;
  email: string;
  telefone?: string;
  role: UserRole;
  id_condominio?: string | number;
  id_unidade?: string | number;
}

export interface Condominio {
  id: string | number;
  nome: string;
  cnpj?: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface Unidade {
  id: string | number; // Aceitar ambos para compatibilidade
  id_condominio: string | number;
  bloco: string;
  numero: string;
  andar: number;
}

export interface Ocorrencia {
  id: string | number;
  id_usuario: string | number;
  id_condominio: string | number;
  titulo: string;
  descricao: string;
  status: 'pendente' | 'em_andamento' | 'resolvida';
  data_registro: string;
  data_resolucao?: string;
  usuario_nome?: string;
}

export interface Espaco {
  id: string | number;
  id_condominio: string | number;
  nome: string;
  capacidade: number;
  ativo: boolean;
}

export interface Reserva {
  id: string | number;
  id_espaco: string | number;
  id_usuario: string | number;
  data_inicio: string;
  data_fim: string;
  status: 'pendente' | 'confirmada' | 'cancelada';
  espaco_nome?: string;
  usuario_nome?: string;
}

export interface Comunicado {
  id: string | number;
  id_condominio: string | number;
  id_usuario: string | number;
  titulo: string;
  mensagem: string;
  enviar_para_todos: boolean;
  data_envio: string;
  usuario_nome?: string;
}

export interface TransacaoFinanceira {
  id: string | number;
  id_condominio: string | number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data_transacao: string;
}

export interface Boleto {
  id: string | number;
  id_condominio: string | number;
  id_unidade: string | number;
  id_usuario: string | number;
  mes_referencia: string;
  ano_referencia: number;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'vencido';
  codigo_barras: string;
  linha_digitavel: string;
  descricao?: string;
  created_at?: string;
  unidade_bloco?: string;
  unidade_numero?: string;
  usuario_nome?: string;
}