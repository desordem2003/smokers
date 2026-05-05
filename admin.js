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
function renderDashboard() {
  document.getElementById('admin-root').innerHTML = `
    <div class="admin-layout">
      <!-- SIDEBAR -->
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">Admin</h2>
        </div>

        <nav class="sidebar-nav">
          <button class="nav-link ${currentPage === 'dashboard' ? 'active' : ''}" onclick="goToPage('dashboard')">
            <span class="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>

          <button class="nav-link ${currentPage === 'products' ? 'active' : ''}" onclick="goToPage('products')">
            <span class="nav-icon">📦</span>
            <span>Produtos</span>
          </button>

          <button class="nav-link ${currentPage === 'orders' ? 'active' : ''}" onclick="goToPage('orders')">
            <span class="nav-icon">🛒</span>
            <span>Pedidos</span>
          </button>

          <button class="nav-link ${currentPage === 'clients' ? 'active' : ''}" onclick="goToPage('clients')">
            <span class="nav-icon">👥</span>
            <span>Clientes</span>
          </button>

          <button class="nav-link ${currentPage === 'coupons' ? 'active' : ''}" onclick="goToPage('coupons')">
            <span class="nav-icon">🎟️</span>
            <span>Cupons</span>
          </button>

          <button class="nav-link ${currentPage === 'reports' ? 'active' : ''}" onclick="goToPage('reports')">
            <span class="nav-icon">📈</span>
            <span>Relatórios</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <a href="/" class="nav-link" style="border-left: none; margin-bottom: 10px;">
            <span class="nav-icon">←</span>
            <span>Voltar ao Site</span>
          </a>
          <p style="font-size: 0.8rem; color: var(--text-secondary); text-align: center; margin-top: 10px;">
            🔒 Autenticação será implementada com Supabase em produção
          </p>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="admin-content">
        <div class="admin-header">
          <h1>${
            currentPage === 'dashboard' ? 'Dashboard' :
            currentPage === 'products' ? 'Gerenciar Produtos' :
            currentPage === 'orders' ? 'Gerenciar Pedidos' :
            currentPage === 'clients' ? 'Gerenciar Clientes' :
            currentPage === 'coupons' ? 'Gerenciar Cupons' :
            currentPage === 'reports' ? 'Relatórios' :
            'Admin'
          }</h1>
          <div class="admin-user">
            <span>👤 ${currentUser.username}</span>
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

function renderPageContent() {
  const content = document.getElementById('page-content');

  switch(currentPage) {
    case 'dashboard':
      renderDashboardPage();
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
  }
}

// DASHBOARD PAGE
function renderDashboardPage() {
  const stats = mockData.stats;
  const totalProfit = mockData.products.reduce((sum, p) => {
    return sum + ((p.price - p.costPrice) * (Math.random() * 50)); // Simulated sales
  }, 0);

  document.getElementById('page-content').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">💰 Vendas do Mês</div>
        <div class="stat-value">R$ ${stats.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        <div class="stat-trend">↑ 12% vs mês anterior</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">📦 Total de Pedidos</div>
        <div class="stat-value">${stats.totalOrders}</div>
        <div class="stat-trend">3 novos hoje</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">👥 Clientes</div>
        <div class="stat-value">${stats.totalClients}</div>
        <div class="stat-trend">2 novos clientes</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">💵 Ticket Médio</div>
        <div class="stat-value">R$ ${stats.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        <div class="stat-trend">↑ 5% vs período anterior</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">📈 Lucro Líquido</div>
        <div class="stat-value">R$ ${totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        <div class="stat-trend">Margem: 35-45%</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">⚠️ Estoque Baixo</div>
        <div class="stat-value">${mockData.products.filter(p => p.stock < 10).length}</div>
        <div class="stat-trend">Produtos para reabastecer</div>
      </div>
    </div>

    <div class="section mt-20">
      <div class="section-header">
        <h2 class="section-title">Pedidos Recentes</h2>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID Pedido</th>
            <th>Cliente</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          ${mockData.orders.map(order => `
            <tr>
              <td>#${order.id}</td>
              <td>${order.client}</td>
              <td>R$ ${order.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td><span class="status-badge status-${order.status}">${order.status}</span></td>
              <td>${order.date}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
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
