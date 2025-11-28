import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Criar cliente Supabase com chave de serviço
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Middleware para autenticação de usuários (requer token de usuário válido)
const authMiddleware = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'Token de autorização não fornecido' }, 401);
  }

  // Verificar se não é apenas a chave anônima
  const publicAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (accessToken === publicAnonKey) {
    return c.json({ error: 'Autenticação de usuário necessária' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    console.log('Erro de autenticação:', error);
    return c.json({ error: 'Não autorizado' }, 401);
  }

  c.set('userId', user.id);
  c.set('userEmail', user.email);
  await next();
};

// Helper function para gerar IDs únicos
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Health check endpoint
app.get("/make-server-fafb1703/health", (c) => {
  return c.json({ status: "ok" });
});

// ========== ROTAS DE AUTENTICAÇÃO ==========

// RF01 - Cadastrar usuário
app.post("/make-server-fafb1703/signup", async (c) => {
  console.log('=== SIGNUP - Rota acessada ===');
  try {
    let body;
    try {
      body = await c.req.json();
    } catch (jsonError) {
      console.error('Erro ao fazer parse do JSON:', jsonError);
      return c.json({ error: 'JSON inválido' }, 400);
    }

    const { email, password, nome, telefone, tipo_usuario, id_condominio } = body;

    console.log('Requisição de cadastro recebida:', { email, nome, tipo_usuario, telefone, id_condominio });

    // Validações
    if (!email || !password || !nome || !tipo_usuario) {
      console.log('Campos obrigatórios faltando');
      return c.json({ 
        error: 'Campos obrigatórios: email, password, nome e tipo_usuario' 
      }, 400);
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Email com formato inválido:', email);
      return c.json({ 
        error: 'Por favor, insira um email válido (ex: usuario@exemplo.com)' 
      }, 400);
    }

    if (password.length < 6) {
      console.log('Senha muito curta');
      return c.json({ 
        error: 'A senha deve ter pelo menos 6 caracteres' 
      }, 400);
    }

    // Criar usuário no Supabase Auth
    console.log('Criando usuário no Supabase Auth...');
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        nome,
        telefone,
        tipo_usuario,
        id_condominio
      },
      // Confirmar email automaticamente já que não temos servidor de email configurado
      email_confirm: true
    });

    if (error) {
      console.log('Erro ao criar usuário no Auth:', error);
      let errorMessage = 'Erro ao criar usuário';
      
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        errorMessage = 'Este email já está cadastrado';
      } else if (error.message.includes('password')) {
        errorMessage = 'Senha inválida. Use pelo menos 6 caracteres';
      } else if (error.message.includes('email')) {
        errorMessage = 'Email inválido';
      } else {
        errorMessage = error.message;
      }
      
      return c.json({ error: errorMessage }, 400);
    }

    console.log('Usuário criado no Auth com sucesso:', data.user.id);

    // Se for síndico e não tiver ID de condomínio, criar um condomínio padrão
    let finalIdCondominio = id_condominio;
    if (tipo_usuario === 'sindico' && !id_condominio) {
      console.log('Criando condomínio padrão para o síndico...');
      const condominioId = generateId();
      const novoCondominio = {
        id: condominioId,
        nome: `Condomínio de ${nome}`,
        endereco: 'A definir',
        cidade: 'A definir',
        estado: 'A definir',
        cep: '00000-000',
        created_at: new Date().toISOString()
      };
      await kv.set(`condominio:${condominioId}`, novoCondominio);
      finalIdCondominio = condominioId;
      console.log('Condomínio criado:', condominioId);
    }

    // Salvar dados adicionais do usuário no KV store
    const userId = data.user.id;
    const userData = {
      id: userId,
      nome,
      email,
      telefone,
      role: tipo_usuario,
      id_condominio: finalIdCondominio,
      created_at: new Date().toISOString()
    };

    console.log('Salvando dados do usuário no KV store...');
    await kv.set(`user:${userId}`, userData);
    await kv.set(`user:email:${email}`, userId);

    console.log('Cadastro concluído com sucesso');
    return c.json({ 
      success: true, 
      user: userData,
      message: 'Usuário cadastrado com sucesso' 
    });
  } catch (error: any) {
    console.error('Erro ao cadastrar usuário:', error);
    return c.json({ 
      error: error.message || 'Erro interno ao cadastrar usuário' 
    }, 500);
  }
});

// RF02 - Realizar Login (gerenciado pelo Supabase no frontend)
app.post("/make-server-fafb1703/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Erro ao fazer login:', error);
      return c.json({ error: 'Credenciais inválidas' }, 401);
    }

    // Buscar dados do usuário no KV store
    const userId = data.user.id;
    const userData = await kv.get(`user:${userId}`);

    return c.json({ 
      success: true,
      session: data.session,
      user: userData 
    });
  } catch (error) {
    console.log('Erro no processo de login:', error);
    return c.json({ error: 'Erro interno ao fazer login' }, 500);
  }
});

// Obter dados do usuário logado
app.get("/make-server-fafb1703/me", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    if (!userData) {
      return c.json({ error: 'Usuário não encontrado' }, 404);
    }

    return c.json(userData);
  } catch (error) {
    console.log('Erro ao buscar dados do usuário:', error);
    return c.json({ error: 'Erro ao buscar dados do usuário' }, 500);
  }
});

// ========== ROTAS DE CONDOMÍNIO ==========

// RF03 - Cadastrar condomínio
app.post("/make-server-fafb1703/condominios", authMiddleware, async (c) => {
  try {
    const condominioData = await c.req.json();
    const id = generateId();
    
    const condominio = {
      id,
      ...condominioData,
      created_at: new Date().toISOString()
    };

    await kv.set(`condominio:${id}`, condominio);
    
    return c.json({ success: true, condominio });
  } catch (error) {
    console.log('Erro ao cadastrar condomínio:', error);
    return c.json({ error: 'Erro ao cadastrar condomínio' }, 500);
  }
});

// Listar condomínios
app.get("/make-server-fafb1703/condominios", authMiddleware, async (c) => {
  try {
    const condominios = await kv.getByPrefix('condominio:');
    return c.json(condominios);
  } catch (error) {
    console.log('Erro ao listar condomínios:', error);
    return c.json({ error: 'Erro ao listar condomínios' }, 500);
  }
});

// Obter condomínio por ID
app.get("/make-server-fafb1703/condominios/:id", authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const condominio = await kv.get(`condominio:${id}`);
    
    if (!condominio) {
      return c.json({ error: 'Condomínio não encontrado' }, 404);
    }

    return c.json(condominio);
  } catch (error) {
    console.log('Erro ao buscar condomínio:', error);
    return c.json({ error: 'Erro ao buscar condomínio' }, 500);
  }
});

// Atualizar condomínio
app.patch("/make-server-fafb1703/condominios/:id", authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const condominio = await kv.get(`condominio:${id}`);
    if (!condominio) {
      return c.json({ error: 'Condomínio não encontrado' }, 404);
    }

    const updatedCondominio = { ...condominio, ...updates, updated_at: new Date().toISOString() };
    await kv.set(`condominio:${id}`, updatedCondominio);

    return c.json({ success: true, condominio: updatedCondominio });
  } catch (error) {
    console.log('Erro ao atualizar condomínio:', error);
    return c.json({ error: 'Erro ao atualizar condomínio' }, 500);
  }
});

// ========== ROTAS DE OCORRÊNCIAS ==========

// RF04 - Registrar ocorrência
app.post("/make-server-fafb1703/ocorrencias", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    const ocorrenciaData = await c.req.json();
    const id = generateId();
    
    const ocorrencia = {
      id,
      id_usuario: userId,
      id_condominio: userData.id_condominio,
      ...ocorrenciaData,
      status: 'pendente',
      data_registro: new Date().toISOString(),
      usuario_nome: userData.nome
    };

    await kv.set(`ocorrencia:${id}`, ocorrencia);
    
    return c.json({ success: true, ocorrencia });
  } catch (error) {
    console.log('Erro ao registrar ocorrência:', error);
    return c.json({ error: 'Erro ao registrar ocorrência' }, 500);
  }
});

// RF05 - Listar ocorrências
app.get("/make-server-fafb1703/ocorrencias", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    const ocorrencias = await kv.getByPrefix('ocorrencia:');
    
    // Filtrar por condomínio
    const filtered = ocorrencias.filter((o: any) => 
      o.id_condominio === userData.id_condominio
    );

    // Se for morador, filtrar apenas suas ocorrências
    if (userData.role === 'morador') {
      return c.json(filtered.filter((o: any) => o.id_usuario === userId));
    }

    return c.json(filtered);
  } catch (error) {
    console.log('Erro ao listar ocorrências:', error);
    return c.json({ error: 'Erro ao listar ocorrências' }, 500);
  }
});

// Atualizar status da ocorrência
app.patch("/make-server-fafb1703/ocorrencias/:id", authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const ocorrencia = await kv.get(`ocorrencia:${id}`);
    if (!ocorrencia) {
      return c.json({ error: 'Ocorrência não encontrada' }, 404);
    }

    const updatedOcorrencia = { 
      ...ocorrencia, 
      ...updates, 
      updated_at: new Date().toISOString() 
    };

    if (updates.status === 'resolvida' && !ocorrencia.data_resolucao) {
      updatedOcorrencia.data_resolucao = new Date().toISOString();
    }

    await kv.set(`ocorrencia:${id}`, updatedOcorrencia);

    return c.json({ success: true, ocorrencia: updatedOcorrencia });
  } catch (error) {
    console.log('Erro ao atualizar ocorrência:', error);
    return c.json({ error: 'Erro ao atualizar ocorrência' }, 500);
  }
});

// ========== ROTAS DE ESPAÇOS COMUNS ==========

// Cadastrar espaço
app.post("/make-server-fafb1703/espacos", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    // Apenas síndico pode cadastrar espaços
    if (userData.role !== 'sindico') {
      return c.json({ error: 'Apenas síndicos podem cadastrar espaços' }, 403);
    }

    const espacoData = await c.req.json();
    const id = generateId();
    
    const espaco = {
      id,
      id_condominio: userData.id_condominio,
      ...espacoData,
      ativo: true,
      created_at: new Date().toISOString()
    };

    await kv.set(`espaco:${id}`, espaco);
    
    return c.json({ success: true, espaco });
  } catch (error) {
    console.log('Erro ao cadastrar espaço:', error);
    return c.json({ error: 'Erro ao cadastrar espaço' }, 500);
  }
});

// Listar espaços
app.get("/make-server-fafb1703/espacos", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    const espacos = await kv.getByPrefix('espaco:');
    
    // Filtrar por condomínio
    const filtered = espacos.filter((e: any) => 
      e.id_condominio === userData.id_condominio && e.ativo
    );

    return c.json(filtered);
  } catch (error) {
    console.log('Erro ao listar espaços:', error);
    return c.json({ error: 'Erro ao listar espaços' }, 500);
  }
});

// Atualizar espaço
app.patch("/make-server-fafb1703/espacos/:id", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    if (userData.role !== 'sindico') {
      return c.json({ error: 'Apenas síndicos podem atualizar espaços' }, 403);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const espaco = await kv.get(`espaco:${id}`);
    if (!espaco) {
      return c.json({ error: 'Espaço não encontrado' }, 404);
    }

    const updatedEspaco = { ...espaco, ...updates, updated_at: new Date().toISOString() };
    await kv.set(`espaco:${id}`, updatedEspaco);

    return c.json({ success: true, espaco: updatedEspaco });
  } catch (error) {
    console.log('Erro ao atualizar espaço:', error);
    return c.json({ error: 'Erro ao atualizar espaço' }, 500);
  }
});

// Deletar espaço (soft delete)
app.delete("/make-server-fafb1703/espacos/:id", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    if (userData.role !== 'sindico') {
      return c.json({ error: 'Apenas síndicos podem deletar espaços' }, 403);
    }

    const id = c.req.param('id');
    const espaco = await kv.get(`espaco:${id}`);
    
    if (!espaco) {
      return c.json({ error: 'Espaço não encontrado' }, 404);
    }

    await kv.set(`espaco:${id}`, { ...espaco, ativo: false, deleted_at: new Date().toISOString() });

    return c.json({ success: true });
  } catch (error) {
    console.log('Erro ao deletar espaço:', error);
    return c.json({ error: 'Erro ao deletar espaço' }, 500);
  }
});

// ========== ROTAS DE RESERVAS ==========

// RF06 - Agendar espaço comum
app.post("/make-server-fafb1703/reservas", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    const reservaData = await c.req.json();
    const id = generateId();
    
    // Verificar se o espaço existe
    const espaco = await kv.get(`espaco:${reservaData.id_espaco}`);
    if (!espaco) {
      return c.json({ error: 'Espaço não encontrado' }, 404);
    }

    // Verificar conflitos de horário
    const todasReservas = await kv.getByPrefix('reserva:');
    const conflito = todasReservas.find((r: any) => 
      r.id_espaco === reservaData.id_espaco &&
      r.status !== 'cancelada' &&
      (
        (reservaData.data_inicio >= r.data_inicio && reservaData.data_inicio < r.data_fim) ||
        (reservaData.data_fim > r.data_inicio && reservaData.data_fim <= r.data_fim) ||
        (reservaData.data_inicio <= r.data_inicio && reservaData.data_fim >= r.data_fim)
      )
    );

    if (conflito) {
      return c.json({ error: 'Horário já reservado' }, 400);
    }

    const reserva = {
      id,
      id_usuario: userId,
      ...reservaData,
      status: 'pendente',
      created_at: new Date().toISOString(),
      usuario_nome: userData.nome,
      espaco_nome: espaco.nome
    };

    console.log('🆕 NOVA RESERVA CRIADA:', { id, status: reserva.status, espaco: espaco.nome, usuario: userData.nome });

    await kv.set(`reserva:${id}`, reserva);
    
    return c.json({ success: true, reserva });
  } catch (error) {
    console.log('Erro ao criar reserva:', error);
    return c.json({ error: 'Erro ao criar reserva' }, 500);
  }
});

// Listar reservas
app.get("/make-server-fafb1703/reservas", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    const reservas = await kv.getByPrefix('reserva:');
    
    console.log(`📋 LISTAR RESERVAS - Role: ${userData.role}, Total: ${reservas.length}`);
    
    // Se for morador, filtrar apenas suas reservas
    if (userData.role === 'morador') {
      const minhasReservas = reservas.filter((r: any) => r.id_usuario === userId);
      console.log(`   └─ Morador: ${minhasReservas.length} reservas`);
      return c.json(minhasReservas);
    }

    // Se for síndico, mostrar todas as reservas do condomínio
    const espacosDoCondominio = await kv.getByPrefix('espaco:');
    const espacosIds = espacosDoCondominio
      .filter((e: any) => e.id_condominio === userData.id_condominio)
      .map((e: any) => e.id);

    const reservasDoCondominio = reservas.filter((r: any) => espacosIds.includes(r.id_espaco));
    const pendentes = reservasDoCondominio.filter((r: any) => r.status === 'pendente').length;
    console.log(`   └─ Síndico: ${reservasDoCondominio.length} reservas (${pendentes} pendentes)`);
    
    return c.json(reservasDoCondominio);
  } catch (error) {
    console.log('Erro ao listar reservas:', error);
    return c.json({ error: 'Erro ao listar reservas' }, 500);
  }
});

// Atualizar status da reserva (aprovar/rejeitar)
app.patch("/make-server-fafb1703/reservas/:id/status", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    // Apenas síndico pode aprovar/rejeitar reservas
    if (userData.role !== 'sindico') {
      return c.json({ error: 'Apenas síndicos podem aprovar ou rejeitar reservas' }, 403);
    }

    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    if (!['confirmada', 'cancelada'].includes(status)) {
      return c.json({ error: 'Status inválido' }, 400);
    }

    const reserva = await kv.get(`reserva:${id}`);
    if (!reserva) {
      return c.json({ error: 'Reserva não encontrada' }, 404);
    }

    const updatedReserva = { 
      ...reserva, 
      status,
      updated_at: new Date().toISOString() 
    };

    console.log(`✅ RESERVA ATUALIZADA: ${id} - Status: ${reserva.status} → ${status}`);

    await kv.set(`reserva:${id}`, updatedReserva);

    return c.json({ success: true, reserva: updatedReserva });
  } catch (error) {
    console.log('Erro ao atualizar status da reserva:', error);
    return c.json({ error: 'Erro ao atualizar status da reserva' }, 500);
  }
});

// Cancelar reserva
app.delete("/make-server-fafb1703/reservas/:id", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id');
    
    const reserva = await kv.get(`reserva:${id}`);
    if (!reserva) {
      return c.json({ error: 'Reserva não encontrada' }, 404);
    }

    // Verificar se o usuário pode cancelar a reserva
    if (reserva.id_usuario !== userId) {
      const userData = await kv.get(`user:${userId}`);
      if (userData.role !== 'sindico') {
        return c.json({ error: 'Você não tem permissão para cancelar esta reserva' }, 403);
      }
    }

    await kv.set(`reserva:${id}`, { 
      ...reserva, 
      status: 'cancelada', 
      cancelled_at: new Date().toISOString() 
    });

    return c.json({ success: true });
  } catch (error) {
    console.log('Erro ao cancelar reserva:', error);
    return c.json({ error: 'Erro ao cancelar reserva' }, 500);
  }
});

// ========== ROTAS DE COMUNICADOS ==========

// RF07 - Enviar comunicado
app.post("/make-server-fafb1703/comunicados", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    // Apenas síndico pode enviar comunicados
    if (userData.role !== 'sindico') {
      return c.json({ error: 'Apenas síndicos podem enviar comunicados' }, 403);
    }

    const comunicadoData = await c.req.json();
    const id = generateId();
    
    const comunicado = {
      id,
      id_usuario: userId,
      id_condominio: userData.id_condominio,
      ...comunicadoData,
      data_envio: new Date().toISOString(),
      usuario_nome: userData.nome
    };

    await kv.set(`comunicado:${id}`, comunicado);

    // Criar destinatários baseado no tipo de envio
    if (comunicadoData.enviar_para_todos) {
      // Enviar para todos os moradores do condomínio
      const todosUsuarios = await kv.getByPrefix('user:');
      const moradores = todosUsuarios.filter((u: any) => 
        u.id_condominio === userData.id_condominio && 
        u.id !== userId &&
        !u.id.startsWith('user:email:') // Filtrar chaves de índice
      );

      for (const morador of moradores) {
        const destId = generateId();
        await kv.set(`destinatario:${destId}`, {
          id: destId,
          id_comunicado: id,
          id_destinatario: morador.id,
          lido: false,
          created_at: new Date().toISOString()
        });
      }
    } else if (comunicadoData.id_morador) {
      // Enviar para morador específico
      const destId = generateId();
      await kv.set(`destinatario:${destId}`, {
        id: destId,
        id_comunicado: id,
        id_destinatario: comunicadoData.id_morador,
        lido: false,
        created_at: new Date().toISOString()
      });
    }
    
    return c.json({ success: true, comunicado });
  } catch (error) {
    console.log('Erro ao enviar comunicado:', error);
    return c.json({ error: 'Erro ao enviar comunicado' }, 500);
  }
});

// Listar comunicados
app.get("/make-server-fafb1703/comunicados", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    // Se for síndico, retornar todos os comunicados do condomínio com info de destinatários
    if (userData.role === 'sindico') {
      const comunicados = await kv.getByPrefix('comunicado:');
      const comunicadosDoCondominio = comunicados.filter((com: any) => 
        com.id_condominio === userData.id_condominio
      );
      
      // Buscar destinatários para cada comunicado
      const destinatarios = await kv.getByPrefix('destinatario:');
      const todosUsuarios = await kv.getByPrefix('user:');
      
      const comunicadosEnriquecidos = comunicadosDoCondominio.map((com: any) => {
        const destinatariosComunicado = destinatarios.filter((d: any) => 
          d.id_comunicado === com.id
        );
        
        // Se foi enviado para todos ou tem múltiplos destinatários
        if (com.enviar_para_todos || destinatariosComunicado.length > 1) {
          return {
            ...com,
            destinatario_tipo: 'todos',
            destinatario_nome: 'Todos os Moradores'
          };
        }
        
        // Se foi enviado para um morador específico
        if (destinatariosComunicado.length === 1) {
          const destinatarioUser = todosUsuarios.find((u: any) => 
            u.id === destinatariosComunicado[0].id_destinatario
          );
          return {
            ...com,
            destinatario_tipo: 'individual',
            destinatario_nome: destinatarioUser?.nome || 'Morador Específico'
          };
        }
        
        // Fallback
        return {
          ...com,
          destinatario_tipo: 'todos',
          destinatario_nome: 'Todos os Moradores'
        };
      });
      
      return c.json(comunicadosEnriquecidos);
    }

    // Se for morador, retornar apenas comunicados destinados a ele
    const destinatarios = await kv.getByPrefix('destinatario:');
    const destinatariosDoMorador = destinatarios.filter((d: any) => 
      d.id_destinatario === userId
    );

    const comunicadosIds = destinatariosDoMorador.map((d: any) => d.id_comunicado);
    const todosComunicados = await kv.getByPrefix('comunicado:');
    
    return c.json(todosComunicados.filter((com: any) => 
      comunicadosIds.includes(com.id)
    ));
  } catch (error) {
    console.log('Erro ao listar comunicados:', error);
    return c.json({ error: 'Erro ao listar comunicados' }, 500);
  }
});

// Marcar comunicado como lido
app.patch("/make-server-fafb1703/comunicados/:id/lido", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const comunicadoId = c.req.param('id');
    
    const destinatarios = await kv.getByPrefix('destinatario:');
    const destinatario = destinatarios.find((d: any) => 
      d.id_comunicado === comunicadoId && d.id_destinatario === userId
    );

    if (destinatario) {
      await kv.set(`destinatario:${destinatario.id}`, {
        ...destinatario,
        lido: true,
        lido_em: new Date().toISOString()
      });
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Erro ao marcar comunicado como lido:', error);
    return c.json({ error: 'Erro ao marcar comunicado como lido' }, 500);
  }
});

// ========== ROTAS DE TRANSAÇÕES FINANCEIRAS ==========

// RF08 - Registrar transação financeira
app.post("/make-server-fafb1703/transacoes", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    // Apenas síndico pode registrar transações
    if (userData.role !== 'sindico') {
      return c.json({ error: 'Apenas síndicos podem registrar transações' }, 403);
    }

    const transacaoData = await c.req.json();
    const id = generateId();
    
    const transacao = {
      id,
      id_condominio: userData.id_condominio,
      ...transacaoData,
      data_transacao: transacaoData.data_transacao || new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    await kv.set(`transacao:${id}`, transacao);
    
    return c.json({ success: true, transacao });
  } catch (error) {
    console.log('Erro ao registrar transação:', error);
    return c.json({ error: 'Erro ao registrar transação' }, 500);
  }
});

// Listar transações financeiras
app.get("/make-server-fafb1703/transacoes", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    const transacoes = await kv.getByPrefix('transacao:');
    
    // Filtrar por condomínio
    return c.json(transacoes.filter((t: any) => 
      t.id_condominio === userData.id_condominio
    ));
  } catch (error) {
    console.log('Erro ao listar transações:', error);
    return c.json({ error: 'Erro ao listar transações' }, 500);
  }
});

// Deletar transação
app.delete("/make-server-fafb1703/transacoes/:id", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    if (userData.role !== 'sindico') {
      return c.json({ error: 'Apenas síndicos podem deletar transações' }, 403);
    }

    const id = c.req.param('id');
    await kv.del(`transacao:${id}`);

    return c.json({ success: true });
  } catch (error) {
    console.log('Erro ao deletar transação:', error);
    return c.json({ error: 'Erro ao deletar transação' }, 500);
  }
});

// ========== ROTAS DE UNIDADES ==========

// RF10 - Cadastrar unidade
app.post("/make-server-fafb1703/unidades", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    // Apenas síndico pode cadastrar unidades
    if (userData.role !== 'sindico') {
      return c.json({ error: 'Apenas síndicos podem cadastrar unidades' }, 403);
    }

    const unidadeData = await c.req.json();
    const id = generateId();
    
    const unidade = {
      id,
      id_condominio: userData.id_condominio,
      ...unidadeData,
      created_at: new Date().toISOString()
    };

    await kv.set(`unidade:${id}`, unidade);
    
    return c.json({ success: true, unidade });
  } catch (error) {
    console.log('Erro ao cadastrar unidade:', error);
    return c.json({ error: 'Erro ao cadastrar unidade' }, 500);
  }
});

// Listar unidades
app.get("/make-server-fafb1703/unidades", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    const unidades = await kv.getByPrefix('unidade:');
    
    // Filtrar por condomínio
    return c.json(unidades.filter((u: any) => 
      u.id_condominio === userData.id_condominio
    ));
  } catch (error) {
    console.log('Erro ao listar unidades:', error);
    return c.json({ error: 'Erro ao listar unidades' }, 500);
  }
});

// Atualizar unidade
app.patch("/make-server-fafb1703/unidades/:id", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    if (userData.role !== 'sindico') {
      return c.json({ error: 'Apenas síndicos podem atualizar unidades' }, 403);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const unidade = await kv.get(`unidade:${id}`);
    if (!unidade) {
      return c.json({ error: 'Unidade não encontrada' }, 404);
    }

    const updatedUnidade = { ...unidade, ...updates, updated_at: new Date().toISOString() };
    await kv.set(`unidade:${id}`, updatedUnidade);

    return c.json({ success: true, unidade: updatedUnidade });
  } catch (error) {
    console.log('Erro ao atualizar unidade:', error);
    return c.json({ error: 'Erro ao atualizar unidade' }, 500);
  }
});

// Deletar unidade
app.delete("/make-server-fafb1703/unidades/:id", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    if (userData.role !== 'sindico') {
      return c.json({ error: 'Apenas síndicos podem deletar unidades' }, 403);
    }

    const id = c.req.param('id');
    await kv.del(`unidade:${id}`);

    return c.json({ success: true });
  } catch (error) {
    console.log('Erro ao deletar unidade:', error);
    return c.json({ error: 'Erro ao deletar unidade' }, 500);
  }
});

// Vincular morador à unidade (pelo síndico)
app.post("/make-server-fafb1703/unidades/:id/moradores", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    if (userData.role !== 'sindico') {
      return c.json({ error: 'Apenas síndicos podem vincular moradores' }, 403);
    }

    const unidadeId = c.req.param('id');
    const { id_usuario } = await c.req.json();
    const id = generateId();
    
    const vinculo = {
      id,
      id_unidade: unidadeId,
      id_usuario,
      data_inicio: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    await kv.set(`morador_unidade:${id}`, vinculo);

    // Atualizar o id_unidade no usuário
    const morador = await kv.get(`user:${id_usuario}`);
    if (morador) {
      await kv.set(`user:${id_usuario}`, { ...morador, id_unidade: unidadeId });
    }
    
    return c.json({ success: true, vinculo });
  } catch (error) {
    console.log('Erro ao vincular morador:', error);
    return c.json({ error: 'Erro ao vincular morador' }, 500);
  }
});

// Vincular o próprio morador à unidade
app.post("/make-server-fafb1703/me/vincular-unidade", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    // Apenas morador pode vincular-se
    if (userData.role !== 'morador') {
      return c.json({ error: 'Apenas moradores podem vincular-se a unidades' }, 403);
    }

    const { id_unidade } = await c.req.json();
    
    if (!id_unidade) {
      return c.json({ error: 'ID da unidade é obrigatório' }, 400);
    }

    // Verificar se a unidade existe
    const unidade = await kv.get(`unidade:${id_unidade}`);
    if (!unidade) {
      return c.json({ error: 'Unidade não encontrada' }, 404);
    }

    // Verificar se a unidade pertence ao mesmo condomínio
    if (unidade.id_condominio !== userData.id_condominio) {
      return c.json({ error: 'Esta unidade não pertence ao seu condomínio' }, 403);
    }

    const id = generateId();
    
    const vinculo = {
      id,
      id_unidade,
      id_usuario: userId,
      data_inicio: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    await kv.set(`morador_unidade:${id}`, vinculo);

    // Atualizar o id_unidade no usuário
    const updatedUserData = { ...userData, id_unidade };
    await kv.set(`user:${userId}`, updatedUserData);
    
    return c.json({ success: true, vinculo, user: updatedUserData });
  } catch (error) {
    console.log('Erro ao vincular unidade:', error);
    return c.json({ error: 'Erro ao vincular unidade' }, 500);
  }
});

// ========== ROTAS DE BOLETOS ==========

// RF09 - Emitir boleto
app.post("/make-server-fafb1703/boletos", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    // Apenas síndico pode emitir boletos
    if (userData.role !== 'sindico') {
      return c.json({ error: 'Apenas síndicos podem emitir boletos' }, 403);
    }

    const boletoData = await c.req.json();
    const id = generateId();
    
    // Buscar a unidade para pegar o morador vinculado
    const unidade = await kv.get(`unidade:${boletoData.id_unidade}`);
    if (!unidade) {
      return c.json({ error: 'Unidade não encontrada' }, 404);
    }

    // Buscar o morador vinculado à unidade
    const todosUsuarios = await kv.getByPrefix('user:');
    const moradorDaUnidade = todosUsuarios.find((u: any) => 
      String(u.id_unidade) === String(boletoData.id_unidade) && u.role === 'morador'
    );

    if (!moradorDaUnidade) {
      return c.json({ error: 'Nenhum morador vinculado a esta unidade' }, 400);
    }
    
    const boleto = {
      id,
      id_condominio: userData.id_condominio,
      id_usuario: moradorDaUnidade.id,
      status: 'pendente', // Status inicial padrão
      ...boletoData,
      created_at: new Date().toISOString()
    };

    await kv.set(`boleto:${id}`, boleto);
    
    return c.json({ success: true, boleto });
  } catch (error) {
    console.log('Erro ao emitir boleto:', error);
    return c.json({ error: 'Erro ao emitir boleto' }, 500);
  }
});

// Listar boletos
app.get("/make-server-fafb1703/boletos", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    const boletos = await kv.getByPrefix('boleto:');
    
    // Se for síndico, mostrar todos os boletos do condomínio com dados enriquecidos
    if (userData.role === 'sindico') {
      // Normalizar IDs para comparação
      const userCondominioId = String(userData.id_condominio);
      
      const boletosDoCondominio = boletos.filter((b: any) => 
        String(b.id_condominio) === userCondominioId
      );

      // Enriquecer com dados de unidade e usuário
      const boletosEnriquecidos = await Promise.all(
        boletosDoCondominio.map(async (boleto: any) => {
          const unidade = await kv.get(`unidade:${boleto.id_unidade}`);
          
          // Buscar usuário pelo id_usuario do boleto
          let usuario = null;
          if (boleto.id_usuario) {
            usuario = await kv.get(`user:${boleto.id_usuario}`);
          }
          
          // Se não encontrou pelo id_usuario, buscar morador da unidade
          if (!usuario) {
            const todosUsuarios = await kv.getByPrefix('user:');
            usuario = todosUsuarios.find((u: any) => 
              String(u.id_unidade) === String(boleto.id_unidade) && u.role === 'morador'
            );
          }
          
          // Verificar se está vencido
          const hoje = new Date();
          const vencimento = new Date(boleto.data_vencimento);
          const isVencido = boleto.status !== 'pago' && vencimento < hoje;
          
          return {
            ...boleto,
            unidade_bloco: unidade?.bloco || '-',
            unidade_numero: unidade?.numero || '-',
            usuario_nome: usuario?.nome || '-',
            status: isVencido ? 'vencido' : boleto.status
          };
        })
      );

      return c.json(boletosEnriquecidos);
    }

    // Se for morador, retornar array vazio se não tiver unidade
    if (!userData.id_unidade) {
      return c.json([]);
    }

    // Normalizar IDs para comparação
    const userUnidadeId = String(userData.id_unidade);
    
    // Filtrar boletos da unidade do morador e enriquecer dados
    const boletosDoMorador = boletos.filter((b: any) => 
      String(b.id_unidade) === userUnidadeId
    );

    const boletosEnriquecidos = await Promise.all(
      boletosDoMorador.map(async (boleto: any) => {
        const unidade = await kv.get(`unidade:${boleto.id_unidade}`);
        
        // Verificar se está vencido
        const hoje = new Date();
        const vencimento = new Date(boleto.data_vencimento);
        const isVencido = boleto.status !== 'pago' && vencimento < hoje;
        
        return {
          ...boleto,
          unidade_bloco: unidade?.bloco || '-',
          unidade_numero: unidade?.numero || '-',
          usuario_nome: userData.nome,
          status: isVencido ? 'vencido' : boleto.status
        };
      })
    );

    return c.json(boletosEnriquecidos);
  } catch (error) {
    console.log('Erro ao listar boletos:', error);
    return c.json({ error: 'Erro ao listar boletos' }, 500);
  }
});

// Listar boletos do morador logado
app.get("/make-server-fafb1703/boletos/meus", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    if (!userData) {
      return c.json({ error: 'Usuário não encontrado' }, 404);
    }
    
    if (!userData.id_unidade) {
      return c.json([]);
    }

    const boletos = await kv.getByPrefix('boleto:');
    
    // Normalizar IDs para comparação
    const userUnidadeId = String(userData.id_unidade);
    
    const boletosDoMorador = boletos.filter((b: any) => {
      const boletoUnidadeId = String(b.id_unidade);
      return boletoUnidadeId === userUnidadeId;
    });

    // Enriquecer com dados da unidade
    const boletosEnriquecidos = await Promise.all(
      boletosDoMorador.map(async (boleto: any) => {
        const unidade = await kv.get(`unidade:${boleto.id_unidade}`);
        
        // Verificar se está vencido
        const hoje = new Date();
        const vencimento = new Date(boleto.data_vencimento);
        const isVencido = boleto.status !== 'pago' && vencimento < hoje;
        
        return {
          ...boleto,
          unidade_bloco: unidade?.bloco || '-',
          unidade_numero: unidade?.numero || '-',
          usuario_nome: userData.nome || '-',
          status: isVencido ? 'vencido' : boleto.status
        };
      })
    );

    return c.json(boletosEnriquecidos);
  } catch (error) {
    console.error('[Boletos Meus] Erro ao listar boletos:', error);
    return c.json({ error: 'Erro ao listar boletos' }, 500);
  }
});

// Atualizar status do boleto (pagamento)
app.patch("/make-server-fafb1703/boletos/:id", authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const boleto = await kv.get(`boleto:${id}`);
    if (!boleto) {
      return c.json({ error: 'Boleto não encontrado' }, 404);
    }

    const updatedBoleto = { 
      ...boleto, 
      ...updates, 
      updated_at: new Date().toISOString() 
    };

    if (updates.status === 'pago' && !boleto.data_pagamento) {
      updatedBoleto.data_pagamento = new Date().toISOString();
    }

    await kv.set(`boleto:${id}`, updatedBoleto);

    return c.json({ success: true, boleto: updatedBoleto });
  } catch (error) {
    console.log('Erro ao atualizar boleto:', error);
    return c.json({ error: 'Erro ao atualizar boleto' }, 500);
  }
});

// ========== ROTAS DE MORADORES ==========

// Listar todos os moradores do condomínio (apenas síndico)
app.get("/make-server-fafb1703/moradores", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    // Apenas síndico pode listar moradores
    if (userData.role !== 'sindico') {
      return c.json({ error: 'Apenas síndicos podem listar moradores' }, 403);
    }

    // Buscar todos os usuários
    const todosUsuarios = await kv.getByPrefix('user:');
    
    // Filtrar apenas moradores do mesmo condomínio
    const moradores = todosUsuarios.filter((u: any) => 
      u.role === 'morador' && u.id_condominio === userData.id_condominio
    );

    console.log(`📋 LISTAR MORADORES - Total: ${moradores.length} moradores`);
    
    return c.json(moradores);
  } catch (error) {
    console.log('Erro ao listar moradores:', error);
    return c.json({ error: 'Erro ao listar moradores' }, 500);
  }
});

// Vincular morador à unidade (apenas síndico)
app.post("/make-server-fafb1703/moradores/vincular-unidade", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    // Apenas síndico pode vincular moradores
    if (userData.role !== 'sindico') {
      return c.json({ error: 'Apenas síndicos podem vincular moradores' }, 403);
    }

    const { id_morador, id_unidade } = await c.req.json();
    
    if (!id_morador || !id_unidade) {
      return c.json({ error: 'ID do morador e ID da unidade são obrigatórios' }, 400);
    }

    // Buscar o morador
    const morador = await kv.get(`user:${id_morador}`);
    if (!morador) {
      return c.json({ error: 'Morador não encontrado' }, 404);
    }

    // Verificar se é morador do mesmo condomínio
    if (morador.id_condominio !== userData.id_condominio) {
      return c.json({ error: 'Este morador não pertence ao seu condomínio' }, 403);
    }

    // Verificar se a unidade existe
    const unidade = await kv.get(`unidade:${id_unidade}`);
    if (!unidade) {
      return c.json({ error: 'Unidade não encontrada' }, 404);
    }

    // Verificar se a unidade pertence ao mesmo condomínio
    if (unidade.id_condominio !== userData.id_condominio) {
      return c.json({ error: 'Esta unidade não pertence ao seu condomínio' }, 403);
    }

    // Atualizar o morador com a unidade
    await kv.set(`user:${id_morador}`, { ...morador, id_unidade });

    console.log(`🔗 MORADOR VINCULADO: ${morador.nome} → Unidade ${id_unidade}`);
    
    return c.json({ success: true, message: 'Morador vinculado com sucesso' });
  } catch (error) {
    console.log('Erro ao vincular morador:', error);
    return c.json({ error: 'Erro ao vincular morador' }, 500);
  }
});

// Desvincular morador da unidade (apenas síndico)
app.post("/make-server-fafb1703/moradores/desvincular-unidade", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    // Apenas síndico pode desvincular moradores
    if (userData.role !== 'sindico') {
      return c.json({ error: 'Apenas síndicos podem desvincular moradores' }, 403);
    }

    const { id_morador } = await c.req.json();
    
    if (!id_morador) {
      return c.json({ error: 'ID do morador é obrigatório' }, 400);
    }

    // Buscar o morador
    const morador = await kv.get(`user:${id_morador}`);
    if (!morador) {
      return c.json({ error: 'Morador não encontrado' }, 404);
    }

    // Verificar se é morador do mesmo condomínio
    if (morador.id_condominio !== userData.id_condominio) {
      return c.json({ error: 'Este morador não pertence ao seu condomínio' }, 403);
    }

    // Remover a vinculação
    await kv.set(`user:${id_morador}`, { ...morador, id_unidade: null });

    console.log(`🔓 MORADOR DESVINCULADO: ${morador.nome}`);
    
    return c.json({ success: true, message: 'Morador desvinculado com sucesso' });
  } catch (error) {
    console.log('Erro ao desvincular morador:', error);
    return c.json({ error: 'Erro ao desvincular morador' }, 500);
  }
});

// Atualizar perfil do usuário
app.put("/make-server-fafb1703/usuarios/perfil", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    if (!userData) {
      return c.json({ error: 'Usuário não encontrado' }, 404);
    }

    const { nome, telefone, email } = await c.req.json();
    
    // Validações
    if (!nome || nome.trim() === '') {
      return c.json({ error: 'Nome é obrigatório' }, 400);
    }

    // Se o email mudou, verificar se já está em uso
    if (email && email !== userData.email) {
      const allUserKeys = await kv.list('user:');
      for (const key of allUserKeys) {
        const user = await kv.get(key);
        if (user && user.email === email && user.id !== userId) {
          return c.json({ error: 'Este email já está em uso' }, 400);
        }
      }
      
      // Atualizar email no Supabase Auth também
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        { email: email }
      );
      
      if (authError) {
        console.log('Erro ao atualizar email no Auth:', authError);
        return c.json({ error: 'Erro ao atualizar email' }, 500);
      }
    }

    // Atualizar dados do usuário
    const updatedUser = {
      ...userData,
      nome: nome.trim(),
      telefone: telefone || userData.telefone,
      email: email || userData.email,
    };

    await kv.set(`user:${userId}`, updatedUser);

    console.log(`👤 PERFIL ATUALIZADO: ${updatedUser.nome}`);
    
    return c.json({ 
      success: true, 
      message: 'Perfil atualizado com sucesso',
      user: updatedUser
    });
  } catch (error) {
    console.log('Erro ao atualizar perfil:', error);
    return c.json({ error: 'Erro ao atualizar perfil' }, 500);
  }
});

// Vincular usuário a um condomínio através de código
app.post("/make-server-fafb1703/usuarios/vincular-condominio", authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    if (!userData) {
      return c.json({ error: 'Usuário não encontrado' }, 404);
    }

    // Apenas moradores podem vincular condomínio
    if (userData.role !== 'morador') {
      return c.json({ error: 'Apenas moradores podem vincular-se a condomínios' }, 403);
    }

    const { codigo_condominio } = await c.req.json();
    
    if (!codigo_condominio || codigo_condominio.trim() === '') {
      return c.json({ error: 'Código do condomínio é obrigatório' }, 400);
    }

    // Verificar se o condomínio existe
    const condominio = await kv.get(`condominio:${codigo_condominio}`);
    if (!condominio) {
      return c.json({ error: 'Código de condomínio inválido' }, 404);
    }

    // Atualizar o usuário com o id_condominio
    const updatedUser = {
      ...userData,
      id_condominio: codigo_condominio,
    };

    await kv.set(`user:${userId}`, updatedUser);

    console.log(`🏢 CONDOMÍNIO VINCULADO: ${userData.nome} → ${condominio.nome}`);
    
    return c.json({ 
      success: true, 
      message: 'Condomínio vinculado com sucesso',
      user: updatedUser,
      condominio: condominio
    });
  } catch (error) {
    console.log('Erro ao vincular condomínio:', error);
    return c.json({ error: 'Erro ao vincular condomínio' }, 500);
  }
});

Deno.serve(app.fetch);