import { supabase } from './supabase.js';

/* =============================================
   SMOKE/RS - ADMIN PANEL LOGIC
   ============================================= */

// State
let currentUser = { username: '' };
let currentPage = 'dashboard';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('admin-root');
  
  // Bloqueio inicial imediato (Remove qualquer conteúdo prévio para segurança)
  root.innerHTML = '';
  document.body.style.display = 'none'; 

  try {
    // 1. Verifica se existe sessão válida no Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) throw new Error('No session');

    // 2. Busca o perfil do usuário para verificar o cargo
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, is_admin')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile || profile.is_admin !== true) {
      throw new Error('Not admin');
    }

    // Se chegou aqui, é admin confirmado!
    currentUser.username = profile.full_name || session.user.email;
    document.body.style.display = 'block'; // Mostra o body novamente
    renderDashboard();

  } catch (error) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.error('[DEV ONLY] Admin Auth Error:', error.message);
    }
    // Falha na validação: Simula página quebrada/inexistente sem dar pistas
    document.body.innerHTML = '';
    document.body.style.display = 'block';
    document.body.style.backgroundColor = '#ffffff'; // Fundo branco padrão
    // Não mostra NENHUMA mensagem de "acesso negado"
  }
});

// Sample Data (Deve ser movido para o banco de dados futuramente)
const mockData = {
  products: [
    { id: 1, sku: 'IGN-V50', name: 'Ignite V50 Watermelon Ice', category: 'Pod', price: 129.90, costPrice: 60, stock: 45, status: 'active' },
    { id: 2, sku: 'ELF-BC5000', name: 'Elfbar BC5000 Blue Razz', category: 'Pod', price: 119.90, costPrice: 55, stock: 32, status: 'active' },
    { id: 3, sku: 'OXB-G8000', name: 'Oxbar G8000 Mango Ice', category: 'Pod', price: 139.90, costPrice: 70, stock: 8, status: 'active' },
    { id: 4, sku: 'NIK-6000', name: 'Nikbar 6000 Puffs', category: 'Pod', price: 109.90, costPrice: 50, stock: 18, status: 'active' },
    { id: 5, sku: 'VAP-XROS', name: 'Vaporesso XROS 3', category: 'Device', price: 289.90, costPrice: 150, stock: 6, status: 'active' },
  ],
  orders: [
    { id: 1001, client: 'João Silva', value: 289.90, status: 'completed', date: '04/05/2026' },
    { id: 1002, client: 'Maria Santos', value: 450.50, status: 'processing', date: '04/05/2026' },
    { id: 1003, client: 'Pedro Costa', value: 129.90, status: 'shipped', date: '03/05/2026' },
    { id: 1004, client: 'Ana Oliveira', value: 679.80, status: 'completed', date: '03/05/2026' },
  ],
  clients: [
    { id: 1, name: 'João Silva', email: 'joao@email.com', phone: '(51) 99999-1111', totalSpent: 1250.50, orders: 4, status: 'active' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', phone: '(51) 99999-2222', totalSpent: 890.25, orders: 3, status: 'active' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@email.com', phone: '(51) 99999-3333', totalSpent: 2150.00, orders: 6, status: 'active' },
    { id: 4, name: 'Ana Oliveira', email: 'ana@email.com', phone: '(51) 99999-4444', totalSpent: 540.30, orders: 2, status: 'inactive' },
    { id: 5, name: 'Carlos Mendes', email: 'carlos@email.com', phone: '(51) 99999-5555', totalSpent: 3200.00, orders: 8, status: 'active' },
  ],
  coupons: [
    { id: 1, code: 'WELCOME10', discount: 10, type: 'percentage', active: true, uses: 25, maxUses: 100, expiresAt: '31/12/2026' },
    { id: 2, code: 'SUMMER20', discount: 20, type: 'percentage', active: true, uses: 15, maxUses: 50, expiresAt: '30/06/2026' },
    { id: 3, code: 'FRETE5', discount: 5, type: 'fixed', active: false, uses: 8, maxUses: 30, expiresAt: '15/05/2026' },
    { id: 4, code: 'PROMO25', discount: 25, type: 'percentage', active: true, uses: 42, maxUses: 100, expiresAt: '30/05/2026' },
  ],
  salesData: [
    { date: '01/05', sales: 450 },
    { date: '02/05', sales: 620 },
    { date: '03/05', sales: 550 },
    { date: '04/05', sales: 800 },
    { date: '05/05', sales: 720 },
  ],
  topProducts: [
    { name: 'Ignite V50', sales: 145, revenue: 18835.50 },
    { name: 'Vaporesso XROS 3', sales: 89, revenue: 25801.10 },
    { name: 'Elfbar BC5000', sales: 156, revenue: 18704.40 },
    { name: 'Oxbar G8000', sales: 102, revenue: 14269.80 },
    { name: 'Nikbar 6000', sales: 201, revenue: 22088.90 },
  ],
  salesByCategory: [
    { category: 'Pod', sales: 604, percentage: 52 },
    { category: 'Device', sales: 89, percentage: 15 },
    { category: 'Essência', sales: 356, percentage: 28 },
    { category: 'Resistência', sales: 51, percentage: 5 },
  ],
  stats: {
    totalSales: 1549.10,
    totalOrders: 4,
    totalClients: 3,
    avgTicket: 387.28
  }
};

// Render Dashboard
const ADMIN_MODULES = [
  { id: 'dashboard', icon: '📊', name: 'Dashboard' },
  { id: 'tickets', icon: '🎫', name: 'Tickets' },
  { id: 'products', icon: '📦', name: 'Produtos' },
  { id: 'variants', icon: '🏷️', name: 'Variações/Sabores' },
  { id: 'orders', icon: '🛒', name: 'Pedidos' },
  { id: 'sales', icon: '💰', name: 'Vendas' },
  { id: 'payments', icon: '💳', name: 'Pagamentos' },
  { id: 'stock', icon: '🏢', name: 'Estoque' },
  { id: 'clients', icon: '👥', name: 'Clientes' },
  { id: 'coupons', icon: '🎟️', name: 'Cupons' },
  { id: 'suppliers', icon: '🏭', name: 'Fornecedores' },
  { id: 'webhooks', icon: '🔗', name: 'Webhooks' },
  { id: 'reports', icon: '📈', name: 'Relatórios' },
  { id: 'notifications', icon: '🔔', name: 'Notificações' },
  { id: 'security', icon: '🔒', name: 'Segurança' },
  { id: 'logs', icon: '📝', name: 'Logs/Auditoria' },
  { id: 'settings', icon: '⚙️', name: 'Configurações' }
];

function renderDashboard() {
  const currentModule = ADMIN_MODULES.find(m => m.id === currentPage) || ADMIN_MODULES[0];

  document.getElementById('admin-root').innerHTML = `
    <div class="admin-layout">
      <!-- SIDEBAR -->
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">Admin Console</h2>
          <p style="color:var(--gray); font-size:0.75rem; margin-top:5px;">Root Access / RBAC</p>
        </div>

        <nav class="sidebar-nav">
          ${ADMIN_MODULES.map(m => `
            <button class="nav-link ${currentPage === m.id ? 'active' : ''}" onclick="goToPage('${m.id}')">
              <span class="nav-icon">${m.icon}</span>
              <span>${m.name}</span>
            </button>
          `).join('')}
        </nav>

        <div class="sidebar-footer">
          <a href="/" class="nav-link" style="border-left: none; margin-bottom: 10px;">
            <span class="nav-icon">←</span>
            <span>Sair do Console</span>
          </a>
          <p style="font-size: 0.75rem; color: var(--text-secondary); text-align: center; margin-top: 10px;">
            🔒 RLS Ativo • Conexão Segura
          </p>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="admin-content">
        <div class="admin-header">
          <div>
            <h1>${currentModule.icon} ${currentModule.name}</h1>
            <p style="color:var(--gray); font-size:0.85rem; margin-top:5px;">Monitoramento e gestão avançada do ecossistema.</p>
          </div>
          <div class="admin-user" style="display:flex; align-items:center; gap:15px; background:var(--bg-glass); padding:10px 20px; border-radius:30px; border:1px solid var(--border);">
            <div style="width:10px; height:10px; border-radius:50%; background:#22c55e; box-shadow:0 0 10px #22c55e;"></div>
            <span>👤 ${currentUser?.username || 'Admin'}</span>
          </div>
        </div>

        <div class="dashboard-content" id="page-content">
          <!-- Conteúdo da página será renderizado aqui -->
        </div>
      </main>
    </div>
  `;

  renderPageContent();
}

function goToPage(page) {
  console.log('Navigating to page:', page);
  currentPage = page;
  renderDashboard();
  console.log('Page rendered:', page);
}

async function renderPageContent() {
  const content = document.getElementById('page-content');

  switch(currentPage) {
    case 'dashboard':
      await renderDashboardPage();
      break;
    case 'products':
      renderProductsPage();
      break;
    case 'orders':
      renderOrdersPage();
      break;
    case 'clients':
      renderClientsPage();
      break;
    case 'coupons':
      renderCouponsPage();
      break;
    case 'reports':
      renderReportsPage();
      break;
    default:
      renderPremiumEmptyState();
      break;
  }
}

function renderPremiumEmptyState() {
  const currentModule = ADMIN_MODULES.find(m => m.id === currentPage) || { name: 'Módulo', icon: '🚀' };
  
  document.getElementById('page-content').innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:100px 20px; text-align:center; background:var(--bg-glass); border:1px solid var(--border); border-radius:16px; backdrop-filter:blur(20px);">
      <div style="font-size:4rem; margin-bottom:20px; filter:drop-shadow(0 0 20px rgba(168,85,247,0.5));">${currentModule.icon}</div>
      <h2 style="font-size:1.8rem; margin-bottom:10px; font-family:'Syne', sans-serif;">${currentModule.name}</h2>
      <p style="color:var(--gray); max-width:500px; line-height:1.6; margin-bottom:30px;">
        Este módulo está aguardando a configuração inicial do banco de dados (Tabelas e RLS).
        Rode o script SQL fornecido na arquitetura para ativar esta área.
      </p>
      <button class="btn-primary" onclick="alert('Funcionalidade habilitada após deploy das tabelas.')" style="display:flex; align-items:center; gap:10px; font-size:1rem; padding:12px 24px;">
        <span style="font-size:1.2rem;">⚡</span> Configurar Banco de Dados
      </button>
      <div style="margin-top:40px; font-size:0.8rem; color:rgba(255,255,255,0.3); letter-spacing:1px; text-transform:uppercase;">
        SMOKE/RS ERP Console • STATUS: PENDENTE
      </div>
    </div>
  `;
}

// DASHBOARD PAGE
// DASHBOARD PAGE
async function renderDashboardPage() {
  document.getElementById('page-content').innerHTML = `
    <div style="text-align:center; padding: 100px;">
      <div style="font-size:3rem; animation: pulse 2s infinite;">⏳</div>
      <h3 style="color:var(--text-secondary); margin-top:20px;">Sincronizando com Supabase...</h3>
    </div>
  `;

  let totalSales = 0, totalOrders = 0, totalClients = 0, avgTicket = 0, totalProfit = 0, lowStock = 0;
  let pendingPayments = 0, webhookErrors = 0, activeProducts = 0, activeCoupons = 0, vipClients = 0;
  let recentOrdersHTML = '';

  try {
    const { count: clientsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    totalClients = clientsCount || 0;

    const { data: productsData } = await supabase.from('products').select('price, stock');
    if (productsData) {
       lowStock = productsData.filter(p => p.stock < 10).length;
       activeProducts = productsData.length;
    }

    const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(6);
    
    if (!ordersError && ordersData && ordersData.length > 0) {
      totalOrders = ordersData.length;
      totalSales = ordersData.reduce((acc, o) => acc + (o.total_value || 0), 0);
      avgTicket = totalSales / totalOrders;
      totalProfit = totalSales * 0.42; // Simulated margin for now
      pendingPayments = ordersData.filter(o => o.status === 'pending').length;
      
      recentOrdersHTML = ordersData.map(order => `
        <tr style="background:rgba(255,255,255,0.02); border-radius:8px;">
          <td style="font-family:monospace; color:var(--purple);">#${String(order.id).substring(0,8)}</td>
          <td>${String(order.customer_id).substring(0,8)}...</td>
          <td style="font-weight:bold;">R$ ${(order.total_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td><span class="status-badge status-${order.status || 'pending'}">${order.status || 'Pendente'}</span></td>
          <td style="color:var(--gray); font-size:0.85rem;">${new Date(order.created_at).toLocaleString('pt-BR')}</td>
        </tr>
      `).join('');
    } else {
      recentOrdersHTML = '<tr><td colspan="5" style="text-align:center; padding:40px; color:var(--text-secondary)">Nenhum pedido encontrado no banco.</td></tr>';
    }

  } catch(e) {
    console.error("Erro ao buscar dados reais do Dashboard:", e);
  }

  document.getElementById('page-content').innerHTML = `
    <!-- Top 4 Primary Metrics -->
    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 20px;">
      <div class="stat-card" style="border-top: 3px solid var(--purple);">
        <div class="stat-label">💰 Receita Bruta (Mês)</div>
        <div class="stat-value" style="font-size:2rem;">R$ ${totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        <div class="stat-trend" style="color:#22c55e;">+12.5% vs mês anterior</div>
      </div>
      <div class="stat-card" style="border-top: 3px solid var(--pink);">
        <div class="stat-label">📈 Lucro Líquido Estimado</div>
        <div class="stat-value" style="font-size:2rem;">R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        <div class="stat-trend">Margem Média: 42%</div>
      </div>
      <div class="stat-card" style="border-top: 3px solid var(--gold);">
        <div class="stat-label">📦 Pedidos Pagos</div>
        <div class="stat-value" style="font-size:2rem;">${totalOrders}</div>
        <div class="stat-trend" style="color:#22c55e;">Conversão de 8.2%</div>
      </div>
      <div class="stat-card" style="border-top: 3px solid var(--orange);">
        <div class="stat-label">👥 Clientes Ativos</div>
        <div class="stat-value" style="font-size:2rem;">${totalClients}</div>
        <div class="stat-trend">Custo de Aquisição: R$ 15,30</div>
      </div>
    </div>

    <!-- Secondary Metrics -->
    <div class="stats-grid" style="grid-template-columns: repeat(8, 1fr); gap:10px; margin-bottom: 30px;">
      <div class="stat-card" style="padding:15px; grid-column: span 2;">
        <div class="stat-label" style="font-size:0.7rem;">💵 Ticket Médio</div>
        <div class="stat-value" style="font-size:1.4rem;">R$ ${avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
      </div>
      <div class="stat-card" style="padding:15px; grid-column: span 2;">
        <div class="stat-label" style="font-size:0.7rem;">⚠️ Estoque Baixo</div>
        <div class="stat-value" style="font-size:1.4rem; color:var(--gold);">${lowStock}</div>
      </div>
      <div class="stat-card" style="padding:15px; grid-column: span 1;">
        <div class="stat-label" style="font-size:0.7rem;">⏳ Pendentes</div>
        <div class="stat-value" style="font-size:1.4rem;">${pendingPayments}</div>
      </div>
      <div class="stat-card" style="padding:15px; grid-column: span 1;">
        <div class="stat-label" style="font-size:0.7rem;">🔴 Erro Webhook</div>
        <div class="stat-value" style="font-size:1.4rem; color:var(--pink);">${webhookErrors}</div>
      </div>
      <div class="stat-card" style="padding:15px; grid-column: span 1;">
        <div class="stat-label" style="font-size:0.7rem;">🎟️ Cupons</div>
        <div class="stat-value" style="font-size:1.4rem;">${activeCoupons}</div>
      </div>
      <div class="stat-card" style="padding:15px; grid-column: span 1;">
        <div class="stat-label" style="font-size:0.7rem;">📦 Produtos</div>
        <div class="stat-value" style="font-size:1.4rem;">${activeProducts}</div>
      </div>
    </div>

    <!-- Charts and Tables Area -->
    <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 30px;">
      
      <!-- Left Column: Sales Chart & Orders -->
      <div style="display:flex; flex-direction:column; gap:30px;">
        <div class="section" style="padding:25px;">
          <h2 class="section-title" style="margin-bottom:20px; font-size:1.1rem;">Desempenho de Vendas (Últimos 7 dias)</h2>
          <div style="height: 200px; display:flex; align-items:flex-end; gap:10px; padding-top:20px; border-bottom:1px solid var(--border); position:relative;">
            <div style="position:absolute; top:0; left:0; width:100%; border-top:1px dashed rgba(255,255,255,0.1);"><span style="font-size:0.7rem; color:var(--gray); position:absolute; top:-15px;">R$ 1.5k</span></div>
            <div style="position:absolute; top:100px; left:0; width:100%; border-top:1px dashed rgba(255,255,255,0.1);"><span style="font-size:0.7rem; color:var(--gray); position:absolute; top:-15px;">R$ 750</span></div>
            <!-- Fake Chart Bars -->
            <div style="flex:1; background:linear-gradient(to top, var(--purple), transparent); height:40%; border-radius:4px 4px 0 0; position:relative;"><span style="position:absolute; bottom:-25px; left:50%; transform:translateX(-50%); font-size:0.7rem; color:var(--gray);">Seg</span></div>
            <div style="flex:1; background:linear-gradient(to top, var(--purple), transparent); height:65%; border-radius:4px 4px 0 0; position:relative;"><span style="position:absolute; bottom:-25px; left:50%; transform:translateX(-50%); font-size:0.7rem; color:var(--gray);">Ter</span></div>
            <div style="flex:1; background:linear-gradient(to top, var(--purple), transparent); height:45%; border-radius:4px 4px 0 0; position:relative;"><span style="position:absolute; bottom:-25px; left:50%; transform:translateX(-50%); font-size:0.7rem; color:var(--gray);">Qua</span></div>
            <div style="flex:1; background:linear-gradient(to top, var(--pink), transparent); height:85%; border-radius:4px 4px 0 0; position:relative; box-shadow:0 0 15px rgba(236,72,153,0.3);"><span style="position:absolute; bottom:-25px; left:50%; transform:translateX(-50%); font-size:0.7rem; color:var(--gray);">Qui</span></div>
            <div style="flex:1; background:linear-gradient(to top, var(--purple), transparent); height:55%; border-radius:4px 4px 0 0; position:relative;"><span style="position:absolute; bottom:-25px; left:50%; transform:translateX(-50%); font-size:0.7rem; color:var(--gray);">Sex</span></div>
            <div style="flex:1; background:linear-gradient(to top, var(--purple), transparent); height:70%; border-radius:4px 4px 0 0; position:relative;"><span style="position:absolute; bottom:-25px; left:50%; transform:translateX(-50%); font-size:0.7rem; color:var(--gray);">Sáb</span></div>
            <div style="flex:1; background:linear-gradient(to top, var(--purple), transparent); height:95%; border-radius:4px 4px 0 0; position:relative;"><span style="position:absolute; bottom:-25px; left:50%; transform:translateX(-50%); font-size:0.7rem; color:var(--gray);">Dom</span></div>
          </div>
          <div style="margin-top:40px; display:flex; justify-content:center; gap:20px; font-size:0.8rem; color:var(--gray);">
            <span style="display:flex; align-items:center; gap:5px;"><div style="width:10px; height:10px; background:var(--purple); border-radius:2px;"></div> Receita</span>
            <span style="display:flex; align-items:center; gap:5px;"><div style="width:10px; height:10px; background:var(--pink); border-radius:2px;"></div> Pico de Vendas</span>
          </div>
        </div>

        <div class="section" style="padding:25px;">
          <div class="section-header" style="margin-bottom:15px; padding-bottom:10px; border-bottom:none;">
            <h2 class="section-title" style="font-size:1.1rem;">Transações em Tempo Real</h2>
            <button class="action-btn" onclick="goToPage('orders')">Ver Todos</button>
          </div>
          <table style="margin-top:0;">
            <thead style="background:rgba(0,0,0,0.3);">
              <tr>
                <th style="padding:10px 15px;">HASH</th>
                <th style="padding:10px 15px;">CLIENTE (UUID)</th>
                <th style="padding:10px 15px;">VALOR</th>
                <th style="padding:10px 15px;">STATUS</th>
                <th style="padding:10px 15px;">HORA</th>
              </tr>
            </thead>
            <tbody style="font-size:0.9rem;">
              ${recentOrdersHTML}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Column: Alerts & Logs -->
      <div style="display:flex; flex-direction:column; gap:30px;">
        
        <div class="section" style="padding:25px; background:linear-gradient(180deg, rgba(236,72,153,0.05), transparent); border-color:rgba(236,72,153,0.2);">
          <h2 class="section-title" style="font-size:1.1rem; color:var(--pink); margin-bottom:20px; display:flex; align-items:center; gap:10px;">
            <span>⚠️</span> Alertas do Sistema
          </h2>
          <div style="display:flex; flex-direction:column; gap:15px;">
            <div style="background:rgba(0,0,0,0.5); padding:15px; border-radius:8px; border-left:3px solid var(--gold);">
              <div style="font-size:0.8rem; color:var(--gray); margin-bottom:5px;">Há 10 minutos</div>
              <div style="font-size:0.95rem;">Produto <strong>Ignite V50 Watermelon</strong> atingiu estoque crítico (Restam 2 un).</div>
            </div>
            <div style="background:rgba(0,0,0,0.5); padding:15px; border-radius:8px; border-left:3px solid var(--pink);">
              <div style="font-size:0.8rem; color:var(--gray); margin-bottom:5px;">Há 45 minutos</div>
              <div style="font-size:0.95rem;">Falha no Webhook de Pagamento (MercadoPago ID: 9812739). Reprocessamento pendente.</div>
            </div>
            <div style="background:rgba(0,0,0,0.5); padding:15px; border-radius:8px; border-left:3px solid var(--purple);">
              <div style="font-size:0.8rem; color:var(--gray); margin-bottom:5px;">Há 2 horas</div>
              <div style="font-size:0.95rem;">Novo cliente VIP identificado: João Silva (LTV > R$ 1.000).</div>
            </div>
          </div>
        </div>

        <div class="section" style="padding:25px;">
          <h2 class="section-title" style="font-size:1.1rem; margin-bottom:20px;">🔥 Produtos em Alta</h2>
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:rgba(255,255,255,0.02); border-radius:8px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <div style="width:30px; height:30px; background:var(--purple); border-radius:4px; display:flex; align-items:center; justify-content:center; font-weight:bold;">1</div>
                <div>
                  <div style="font-size:0.9rem; font-weight:bold;">Ignite V50 Mint</div>
                  <div style="font-size:0.75rem; color:var(--gray);">145 vendas esta semana</div>
                </div>
              </div>
              <div style="color:#22c55e; font-weight:bold;">+22%</div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:rgba(255,255,255,0.02); border-radius:8px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <div style="width:30px; height:30px; background:var(--bg-dark); border:1px solid var(--border); border-radius:4px; display:flex; align-items:center; justify-content:center; font-weight:bold;">2</div>
                <div>
                  <div style="font-size:0.9rem; font-weight:bold;">Elfbar BC5000</div>
                  <div style="font-size:0.75rem; color:var(--gray);">98 vendas esta semana</div>
                </div>
              </div>
              <div style="color:#22c55e; font-weight:bold;">+15%</div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:rgba(255,255,255,0.02); border-radius:8px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <div style="width:30px; height:30px; background:var(--bg-dark); border:1px solid var(--border); border-radius:4px; display:flex; align-items:center; justify-content:center; font-weight:bold;">3</div>
                <div>
                  <div style="font-size:0.9rem; font-weight:bold;">Vaporesso XROS 3</div>
                  <div style="font-size:0.75rem; color:var(--gray);">42 vendas esta semana</div>
                </div>
              </div>
              <div style="color:var(--gray); font-weight:bold;">-2%</div>
            </div>
          </div>
          <button class="action-btn" style="width:100%; margin-top:15px; padding:10px;" onclick="goToPage('reports')">Ver Relatório Completo</button>
        </div>

      </div>
    </div>
  `;
}

// PRODUCTS PAGE
function renderProductsPage() {
  console.log('Rendering products page...');
  document.getElementById('page-content').innerHTML = `
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">Produtos</h2>
        <button class="btn-primary" onclick="showProductForm()">+ Novo Produto</button>
      </div>

      <input type="text" class="search-box" placeholder="Buscar produtos..." onkeyup="filterProducts(this.value)">

      <table style="margin-top: 20px;" id="products-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Preço Venda</th>
            <th>Preço Custo</th>
            <th>Margem</th>
            <th>Estoque</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${mockData.products.map(product => {
            const margin = ((product.price - product.costPrice) / product.price * 100).toFixed(1);
            return `
              <tr data-sku="${product.sku}">
                <td>${product.sku}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>R$ ${product.costPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="profit-column">${margin}%</td>
                <td>${product.stock}</td>
                <td><span class="status-badge status-${product.status === 'active' ? 'active' : 'inactive'}">${product.status === 'active' ? 'Ativo' : 'Inativo'}</span></td>
                <td>
                  <button class="action-btn" onclick="editProduct(${product.id})">✏️</button>
                  <button class="action-btn danger" onclick="deleteProduct(${product.id}, '${product.name}')">🗑️</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div id="product-form-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); align-items: center; justify-content: center; z-index: 1000;">
      <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 30px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto;">
        <h2 style="margin-bottom: 20px; color: var(--primary);">Novo Produto</h2>

        <form onsubmit="saveProduct(event)">
          <div class="form-group">
            <label>SKU</label>
            <input type="text" id="product-sku" required>
          </div>

          <div class="form-group">
            <label>Nome</label>
            <input type="text" id="product-name" required>
          </div>

          <div class="form-group">
            <label>Categoria</label>
            <input type="text" id="product-category" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="form-group">
              <label>Preço de Custo (R$)</label>
              <input type="number" id="product-cost" step="0.01" required>
            </div>

            <div class="form-group">
              <label>Preço de Venda (R$)</label>
              <input type="number" id="product-price" step="0.01" required>
            </div>
          </div>

          <div class="form-group">
            <label>Estoque</label>
            <input type="number" id="product-stock" value="0" required>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="submit" class="btn-primary" style="flex: 1;">Salvar</button>
            <button type="button" class="action-btn danger" onclick="closeProductForm()" style="flex: 1; padding: 10px;">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// ORDERS PAGE
function renderOrdersPage() {
  console.log('Rendering orders page...');
  document.getElementById('page-content').innerHTML = `
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">Pedidos</h2>
      </div>

      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
        <input type="text" class="search-box" placeholder="Buscar pedidos..." onkeyup="filterOrders(this.value)" style="flex: 1;">
        <select id="status-filter" style="padding: 10px 15px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); cursor: pointer;" onchange="filterOrdersByStatus(this.value)">
          <option value="">Todos os Status</option>
          <option value="processing">Processando</option>
          <option value="shipped">Enviado</option>
          <option value="completed">Entregue</option>
        </select>
      </div>

      <table id="orders-table">
        <thead>
          <tr>
            <th>ID Pedido</th>
            <th>Cliente</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${mockData.orders.map(order => `
            <tr data-id="${order.id}" data-status="${order.status}">
              <td><strong>#${order.id}</strong></td>
              <td>${order.client}</td>
              <td>R$ ${order.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td><span class="status-badge status-${order.status}">${getStatusLabel(order.status)}</span></td>
              <td>${order.date}</td>
              <td>
                <button class="action-btn" onclick="viewOrder(${order.id})">👁️ Ver</button>
                <button class="action-btn" onclick="updateOrderStatus(${order.id})">↻ Atualizar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div id="order-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); align-items: center; justify-content: center; z-index: 1000;">
      <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 30px; width: 90%; max-width: 500px;">
        <h2 id="order-modal-title" style="margin-bottom: 20px; color: var(--primary);">Detalhes do Pedido</h2>
        <div id="order-modal-content"></div>
        <button onclick="closeOrderModal()" class="btn-primary" style="width: 100%; margin-top: 20px;">Fechar</button>
      </div>
    </div>
  `;
}

// Helper Functions
function getStatusLabel(status) {
  const labels = {
    'processing': 'Processando',
    'shipped': 'Enviado',
    'completed': 'Entregue'
  };
  return labels[status] || status;
}

// PRODUCTS FUNCTIONS
function showProductForm() {
  const modal = document.getElementById('product-form-modal');
  if (modal) {
    modal.style.display = 'flex';
    console.log('Product form modal opened');
  }
}

function closeProductForm() {
  const modal = document.getElementById('product-form-modal');
  if (modal) {
    modal.style.display = 'none';
    console.log('Product form modal closed');
  }
}

function saveProduct(event) {
  event.preventDefault();
  const newProduct = {
    id: Math.max(...mockData.products.map(p => p.id)) + 1,
    sku: document.getElementById('product-sku').value,
    name: document.getElementById('product-name').value,
    category: document.getElementById('product-category').value,
    price: parseFloat(document.getElementById('product-price').value),
    costPrice: parseFloat(document.getElementById('product-cost').value),
    stock: parseInt(document.getElementById('product-stock').value),
    status: 'active'
  };

  mockData.products.push(newProduct);
  closeProductForm();
  renderProductsPage();
  alert('Produto criado com sucesso!');
}

function editProduct(id) {
  alert('Funcionalidade de edição será implementada: Produto #' + id);
}

function deleteProduct(id, name) {
  if (confirm('Tem certeza que deseja deletar ' + name + '?')) {
    mockData.products = mockData.products.filter(p => p.id !== id);
    renderProductsPage();
    alert('Produto deletado com sucesso!');
  }
}

function filterProducts(searchTerm) {
  const rows = document.querySelectorAll('#products-table tbody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
  });
}

// ORDERS FUNCTIONS
function filterOrders(searchTerm) {
  const rows = document.querySelectorAll('#orders-table tbody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
  });
}

function filterOrdersByStatus(status) {
  const rows = document.querySelectorAll('#orders-table tbody tr');
  rows.forEach(row => {
    if (!status) {
      row.style.display = '';
    } else {
      row.style.display = row.dataset.status === status ? '' : 'none';
    }
  });
}

function viewOrder(id) {
  const order = mockData.orders.find(o => o.id === id);
  if (order) {
    const modal = document.getElementById('order-modal');
    const title = document.getElementById('order-modal-title');
    const content = document.getElementById('order-modal-content');

    if (title && content && modal) {
      title.textContent = `Pedido #${order.id}`;
      content.innerHTML = `
        <div style="line-height: 2;">
          <p><strong>Cliente:</strong> ${order.client}</p>
          <p><strong>Valor:</strong> R$ ${order.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${getStatusLabel(order.status)}</span></p>
          <p><strong>Data:</strong> ${order.date}</p>
        </div>
      `;
      modal.style.display = 'flex';
      console.log('Order modal opened for order #' + id);
    }
  }
}

function updateOrderStatus(id) {
  const order = mockData.orders.find(o => o.id === id);
  if (order) {
    const statuses = ['processing', 'shipped', 'completed'];
    const currentIndex = statuses.indexOf(order.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    order.status = nextStatus;
    renderOrdersPage();
    alert('Status atualizado para: ' + getStatusLabel(nextStatus));
  }
}

function closeOrderModal() {
  const modal = document.getElementById('order-modal');
  if (modal) {
    modal.style.display = 'none';
    console.log('Order modal closed');
  }
}

// CLIENTS PAGE
function renderClientsPage() {
  console.log('Rendering clients page...');
  document.getElementById('page-content').innerHTML = `
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">Clientes</h2>
        <button class="btn-primary" onclick="showClientForm()">+ Novo Cliente</button>
      </div>

      <input type="text" class="search-box" placeholder="Buscar clientes..." onkeyup="filterClients(this.value)">

      <table style="margin-top: 20px;" id="clients-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Total Gasto</th>
            <th>Pedidos</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${mockData.clients.map(client => `
            <tr data-name="${client.name}">
              <td>${client.name}</td>
              <td>${client.email}</td>
              <td>${client.phone}</td>
              <td>R$ ${client.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td>${client.orders}</td>
              <td><span class="status-badge status-${client.status}">${client.status === 'active' ? 'Ativo' : 'Inativo'}</span></td>
              <td>
                <button class="action-btn" onclick="viewClient(${client.id})">👁️</button>
                <button class="action-btn" onclick="editClient(${client.id})">✏️</button>
                <button class="action-btn danger" onclick="deleteClient(${client.id}, '${client.name}')">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div id="client-form-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); align-items: center; justify-content: center; z-index: 1000;">
      <div style="background: var(--bg-glass); border: 1px solid var(--border); border-radius: 12px; padding: 30px; width: 90%; max-width: 600px;">
        <h2 style="margin-bottom: 20px; color: var(--purple);">Novo Cliente</h2>
        <form onsubmit="saveClient(event)">
          <div class="form-group">
            <label>Nome</label>
            <input type="text" id="client-name" required>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="client-email" required>
            </div>
            <div class="form-group">
              <label>Telefone</label>
              <input type="text" id="client-phone" required>
            </div>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="submit" class="btn-primary" style="flex: 1;">Salvar</button>
            <button type="button" class="action-btn danger" onclick="closeClientForm()" style="flex: 1; padding: 10px;">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// COUPONS PAGE
function renderCouponsPage() {
  console.log('Rendering coupons page...');
  document.getElementById('page-content').innerHTML = `
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">Cupons e Promoções</h2>
        <button class="btn-primary" onclick="showCouponForm()">+ Novo Cupom</button>
      </div>

      <input type="text" class="search-box" placeholder="Buscar cupons..." onkeyup="filterCoupons(this.value)">

      <table style="margin-top: 20px;" id="coupons-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Desconto</th>
            <th>Tipo</th>
            <th>Usos</th>
            <th>Status</th>
            <th>Expira em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${mockData.coupons.map(coupon => `
            <tr data-code="${coupon.code}">
              <td><strong>${coupon.code}</strong></td>
              <td>${coupon.discount}${coupon.type === 'percentage' ? '%' : 'R$'}</td>
              <td>${coupon.type === 'percentage' ? 'Percentual' : 'Fixo'}</td>
              <td>${coupon.uses}/${coupon.maxUses}</td>
              <td><span class="status-badge status-${coupon.active ? 'active' : 'inactive'}">${coupon.active ? 'Ativo' : 'Inativo'}</span></td>
              <td>${coupon.expiresAt}</td>
              <td>
                <button class="action-btn" onclick="toggleCoupon(${coupon.id})">${coupon.active ? '❌' : '✅'}</button>
                <button class="action-btn danger" onclick="deleteCoupon(${coupon.id}, '${coupon.code}')">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div id="coupon-form-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); align-items: center; justify-content: center; z-index: 1000;">
      <div style="background: var(--bg-glass); border: 1px solid var(--border); border-radius: 12px; padding: 30px; width: 90%; max-width: 600px;">
        <h2 style="margin-bottom: 20px; color: var(--purple);">Novo Cupom</h2>
        <form onsubmit="saveCoupon(event)">
          <div class="form-group">
            <label>Código</label>
            <input type="text" id="coupon-code" placeholder="ex: WELCOME10" required>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="form-group">
              <label>Desconto</label>
              <input type="number" id="coupon-discount" step="0.01" required>
            </div>
            <div class="form-group">
              <label>Tipo</label>
              <select id="coupon-type" required>
                <option value="percentage">Percentual (%)</option>
                <option value="fixed">Fixo (R$)</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Usos Máximos</label>
            <input type="number" id="coupon-max-uses" value="100" required>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="submit" class="btn-primary" style="flex: 1;">Salvar</button>
            <button type="button" class="action-btn danger" onclick="closeCouponForm()" style="flex: 1; padding: 10px;">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// REPORTS PAGE
function renderReportsPage() {
  console.log('Rendering reports page...');
  document.getElementById('page-content').innerHTML = `
    <div class="dashboard-content">
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Filtro de Período</h2>
          <div style="display: flex; gap: 10px;">
            <button class="action-btn" onclick="setPeriod(7)">Últimos 7 dias</button>
            <button class="action-btn" onclick="setPeriod(30)">Últimos 30 dias</button>
            <button class="action-btn" onclick="setPeriod(90)">Últimos 90 dias</button>
            <button class="action-btn" onclick="exportReport()">📥 Exportar</button>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">💰 Total de Vendas</div>
          <div class="stat-value">R$ ${mockData.stats.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div class="stat-trend">↑ 8% vs período anterior</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">📦 Total de Pedidos</div>
          <div class="stat-value">${mockData.stats.totalOrders}</div>
          <div class="stat-trend">↑ 3 novos pedidos</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">👥 Clientes Ativos</div>
          <div class="stat-value">${mockData.clients.filter(c => c.status === 'active').length}</div>
          <div class="stat-trend">↑ 1 novo cliente</div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Vendas ao Longo do Tempo</h2>
        </div>
        <canvas id="salesChart" style="max-height: 300px;"></canvas>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Produtos Mais Vendidos</h2>
          </div>
          <canvas id="productsChart" style="max-height: 300px;"></canvas>
        </div>

        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Vendas por Categoria</h2>
          </div>
          <canvas id="categoriesChart" style="max-height: 300px;"></canvas>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Top Produtos</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade Vendida</th>
              <th>Receita Total</th>
            </tr>
          </thead>
          <tbody>
            ${mockData.topProducts.map(product => `
              <tr>
                <td>${product.name}</td>
                <td>${product.sales}</td>
                <td>R$ ${product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Initialize charts after rendering
  setTimeout(initCharts, 100);
}

// Initialize charts
function initCharts() {
  // Sales Chart
  const salesCtx = document.getElementById('salesChart');
  if (salesCtx) {
    new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: mockData.salesData.map(d => d.date),
        datasets: [{
          label: 'Vendas (R$)',
          data: mockData.salesData.map(d => d.sales),
          borderColor: '#a855f7',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: { color: '#ffffff' }
          }
        },
        scales: {
          y: {
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.08)' }
          },
          x: {
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.08)' }
          }
        }
      }
    });
  }

  // Products Chart
  const productsCtx = document.getElementById('productsChart');
  if (productsCtx) {
    new Chart(productsCtx, {
      type: 'bar',
      data: {
        labels: mockData.topProducts.map(p => p.name),
        datasets: [{
          label: 'Quantidade Vendida',
          data: mockData.topProducts.map(p => p.sales),
          backgroundColor: [
            'rgba(168, 85, 247, 0.7)',
            'rgba(236, 72, 153, 0.7)',
            'rgba(249, 115, 22, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(34, 197, 94, 0.7)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: { color: '#ffffff' }
          }
        },
        scales: {
          y: {
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.08)' }
          },
          x: {
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.08)' }
          }
        }
      }
    });
  }

  // Categories Chart
  const categoriesCtx = document.getElementById('categoriesChart');
  if (categoriesCtx) {
    new Chart(categoriesCtx, {
      type: 'doughnut',
      data: {
        labels: mockData.salesByCategory.map(c => c.category),
        datasets: [{
          data: mockData.salesByCategory.map(c => c.sales),
          backgroundColor: [
            'rgba(168, 85, 247, 0.7)',
            'rgba(236, 72, 153, 0.7)',
            'rgba(249, 115, 22, 0.7)',
            'rgba(245, 158, 11, 0.7)'
          ],
          borderColor: 'rgba(255, 255, 255, 0.08)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: { color: '#ffffff' }
          }
        }
      }
    });
  }
}

// CLIENTS FUNCTIONS
function showClientForm() {
  document.getElementById('client-form-modal').style.display = 'flex';
}

function closeClientForm() {
  document.getElementById('client-form-modal').style.display = 'none';
}

function saveClient(event) {
  event.preventDefault();
  const newClient = {
    id: Math.max(...mockData.clients.map(c => c.id)) + 1,
    name: document.getElementById('client-name').value,
    email: document.getElementById('client-email').value,
    phone: document.getElementById('client-phone').value,
    totalSpent: 0,
    orders: 0,
    status: 'active'
  };
  mockData.clients.push(newClient);
  closeClientForm();
  renderClientsPage();
  alert('Cliente criado com sucesso!');
}

function viewClient(id) {
  alert('Visualizar detalhes do cliente #' + id);
}

function editClient(id) {
  alert('Editar cliente #' + id);
}

function deleteClient(id, name) {
  if (confirm('Tem certeza que deseja deletar ' + name + '?')) {
    mockData.clients = mockData.clients.filter(c => c.id !== id);
    renderClientsPage();
    alert('Cliente deletado com sucesso!');
  }
}

function filterClients(searchTerm) {
  const rows = document.querySelectorAll('#clients-table tbody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
  });
}

// COUPONS FUNCTIONS
function showCouponForm() {
  document.getElementById('coupon-form-modal').style.display = 'flex';
}

function closeCouponForm() {
  document.getElementById('coupon-form-modal').style.display = 'none';
}

function saveCoupon(event) {
  event.preventDefault();
  const newCoupon = {
    id: Math.max(...mockData.coupons.map(c => c.id)) + 1,
    code: document.getElementById('coupon-code').value,
    discount: parseFloat(document.getElementById('coupon-discount').value),
    type: document.getElementById('coupon-type').value,
    active: true,
    uses: 0,
    maxUses: parseInt(document.getElementById('coupon-max-uses').value),
    expiresAt: '31/12/2026'
  };
  mockData.coupons.push(newCoupon);
  closeCouponForm();
  renderCouponsPage();
  alert('Cupom criado com sucesso!');
}

function toggleCoupon(id) {
  const coupon = mockData.coupons.find(c => c.id === id);
  if (coupon) {
    coupon.active = !coupon.active;
    renderCouponsPage();
  }
}

function deleteCoupon(id, code) {
  if (confirm('Tem certeza que deseja deletar o cupom ' + code + '?')) {
    mockData.coupons = mockData.coupons.filter(c => c.id !== id);
    renderCouponsPage();
    alert('Cupom deletado com sucesso!');
  }
}

function filterCoupons(searchTerm) {
  const rows = document.querySelectorAll('#coupons-table tbody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
  });
}

// REPORTS FUNCTIONS
function setPeriod(days) {
  alert('Filtro de período definido para: últimos ' + days + ' dias');
}

function exportReport() {
  const reportData = {
    date: new Date().toLocaleDateString('pt-BR'),
    totalSales: mockData.stats.totalSales,
    totalOrders: mockData.stats.totalOrders,
    clients: mockData.clients.length,
    topProducts: mockData.topProducts,
    salesByCategory: mockData.salesByCategory
  };
  const json = JSON.stringify(reportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'relatorio-' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  alert('Relatório exportado com sucesso!');
}

// Expor funções globalmente para onclick handlers funcionarem com type="module"
window.goToPage = goToPage;
window.showProductForm = showProductForm;
window.closeProductForm = closeProductForm;
window.saveProduct = saveProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.filterProducts = filterProducts;
window.filterOrders = filterOrders;
window.filterOrdersByStatus = filterOrdersByStatus;
window.viewOrder = viewOrder;
window.updateOrderStatus = updateOrderStatus;
window.closeOrderModal = closeOrderModal;
window.getStatusLabel = getStatusLabel;
window.renderClientsPage = renderClientsPage;
window.showClientForm = showClientForm;
window.closeClientForm = closeClientForm;
window.saveClient = saveClient;
window.viewClient = viewClient;
window.editClient = editClient;
window.deleteClient = deleteClient;
window.filterClients = filterClients;
window.renderCouponsPage = renderCouponsPage;
window.showCouponForm = showCouponForm;
window.closeCouponForm = closeCouponForm;
window.saveCoupon = saveCoupon;
window.toggleCoupon = toggleCoupon;
window.deleteCoupon = deleteCoupon;
window.filterCoupons = filterCoupons;
window.renderReportsPage = renderReportsPage;
window.setPeriod = setPeriod;
window.exportReport = exportReport;
window.initCharts = initCharts;
