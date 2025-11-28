import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Criar cliente Supabase (singleton)
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!supabaseClient) {
    const supabaseUrl = `https://${projectId}.supabase.co`;
    supabaseClient = createSupabaseClient(supabaseUrl, publicAnonKey);
  }
  return supabaseClient;
}

// URL base do servidor
export const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-fafb1703`;

// Helper para fazer requisições autenticadas
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${SERVER_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `Erro ${response.status}`);
  }

  return response.json();
}

// Helper para fazer requisições públicas (não autenticadas)
export async function fetchPublic(endpoint: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
    ...options.headers,
  };

  const url = `${SERVER_URL}${endpoint}`;
  console.log('fetchPublic - URL:', url);
  console.log('fetchPublic - Headers:', headers);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log('fetchPublic - Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('fetchPublic - Error response:', errorText);
    
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { error: errorText || 'Erro desconhecido' };
    }
    
    throw new Error(error.error || `Erro ${response.status}`);
  }

  return response.json();
}
