import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Exportar status das variáveis de ambiente
export const hasEnvironmentVariables = !!(supabaseUrl && supabaseAnonKey);

// Criar cliente apenas se as variáveis existirem
export const supabase = hasEnvironmentVariables 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null as any; // Será tratado no App.tsx
