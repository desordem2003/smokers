import { supabase } from './supabase.js'
import { Home } from './pages/Home.js'
import { Login } from './pages/Login.js'
import { Register } from './pages/Register.js'
import { Catalog } from './pages/Catalog.js'
import { ProductDetails } from './pages/ProductDetails.js'
import { Cart } from './pages/Cart.js'
import { Checkout } from './pages/Checkout.js'
import { Account } from './pages/Account.js'
import { Admin } from './pages/Admin.js'
import { RecoverPassword } from './pages/RecoverPassword.js'
import { ResetPassword } from './pages/ResetPassword.js'

// --- STATE ---
let products = [];
let cart = JSON.parse(localStorage.getItem('smokers-cart')) || [];
let currentUser = null;

// --- AUTH LOGIC ---
async function setupAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  await handleAuthChange(session);

  supabase.auth.onAuthStateChange(async (_event, session) => {
    await handleAuthChange(session);
  });
  
  const userBtn = document.getElementById('user-btn');
  const userDropdown = document.getElementById('user-dropdown');
  
  if (userBtn) {
    userBtn.onclick = (e) => {
      e.preventDefault();
      if (currentUser) {
        userDropdown.classList.toggle('show');
      } else {
        navigate('/login');
      }
    };
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#user-menu-container') && userDropdown) {
      userDropdown.classList.remove('show');
    }
  });
}

async function handleAuthChange(session) {
  if (session) {
    const user = session.user;
    let name = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0];
    let isAdmin = false;

    try {
      const { data: profile } = await supabase.from('profiles').select('full_name, is_admin').eq('id', user.id).single();
      if (profile) {
        if (profile.full_name) name = profile.full_name;
        isAdmin = profile.is_admin === true;
      }
    } catch(e) {}

    currentUser = { ...user, name, isAdmin };
    updateUserUI(true);
  } else {
    currentUser = null;
    updateUserUI(false);
  }
}

function updateUserUI(isLogged) {
  const nameEl = document.getElementById('user-display-name');
  const emailEl = document.getElementById('dropdown-email');
  const adminLink = document.getElementById('admin-panel-link');
  const dropdown = document.getElementById('user-dropdown');

  if (isLogged && currentUser) {
    if (nameEl) nameEl.textContent = currentUser.name.split(' ')[0];
    if (emailEl) emailEl.textContent = currentUser.email;
    if (adminLink) adminLink.style.display = currentUser.isAdmin ? 'block' : 'none';
  } else {
    if (nameEl) nameEl.textContent = 'Minha Conta';
    if (dropdown) dropdown.classList.remove('show');
  }
}

// --- ROUTER ---
const routes = {
  '/': Home,
  '/login': Login,
  '/registro': Register,
  '/produtos': Catalog,
  '/carrinho': Cart,
  '/checkout/1': () => Checkout('1'),
  '/checkout/2': () => Checkout('2'),
  '/checkout/3': () => Checkout('3'),
  '/minha-conta/perfil': () => Account('perfil'),
  '/minha-conta/pedidos': () => Account('pedidos'),
  '/admin/dashboard': () => Admin('dashboard'),
  '/admin/produtos': () => Admin('produtos'),
  '/recuperar-senha': RecoverPassword,
  '/redefinir-senha': ResetPassword,
  '/produto': ProductDetails
};

window.navigate = navigate;

async function navigate(path) {
  window.history.pushState({}, '', path);
  await handleRoute();
}

async function handleRoute() {
  let path = window.location.pathname;
  const app = document.getElementById('app');

  // Proteção de rotas
  const isAuthRoute = path === '/login' || path === '/registro' || path === '/recuperar-senha' || path === '/redefinir-senha';
  const isProtectedRoute = path.startsWith('/minha-conta') || path.startsWith('/checkout');

  if (currentUser && isAuthRoute) {
    window.history.replaceState({}, '', '/');
    path = '/';
  } else if (!currentUser && isProtectedRoute) {
    window.history.replaceState({}, '', '/login');
    path = '/login';
  }

  // Proteção rotas SPA admin
  if (path.startsWith('/admin') && (!currentUser || !currentUser.isAdmin)) {
    window.history.replaceState({}, '', '/');
    path = '/';
  }

  let component = routes[path];
  let id = null;

  if (!component && path.startsWith('/produto/')) {
    component = routes['/produto'];
    id = path.split('/')[2];
  }

  if (!component) component = routes['/'];
  app.innerHTML = await component(id);

  if (path === '/') { await renderGrids(); renderCategories(); }
  else if (path === '/produtos') { await renderCatalogGrid(); }
  else if (path.startsWith('/produto/')) { await setupProductDetailsLogic(id); }
  else if (path === '/login') { setupLoginLogic(); }
  else if (path === '/registro') { setupRegisterLogic(); }

  setupNavLinks();
}

window.onpopstate = handleRoute;

function setupNavLinks() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.onclick = (e) => { e.preventDefault(); navigate(link.getAttribute('href')); };
  });
}

// --- LOGIC ---
async function fetchProducts() {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    console.log('Produtos carregados:', data);
    return data || [];
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    return [];
  }
}

function createProductCard(p) {
  const imgSrc = p.img.startsWith('http') ? p.img : (p.img.startsWith('/') ? p.img : '/' + p.img);
  return `
    <div class="product-card">
      ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
      <a href="/produto/${p.id}" class="card-img-wrap nav-link"><img src="${imgSrc}" onerror="this.src='/assets/pod_product.png'"></a>
      <div class="card-info">
        <a href="/produto/${p.id}" class="card-name nav-link">${p.name}</a>
        <div class="card-price-row"><span class="price-current">R$ ${p.price?.toFixed(2) || '0.00'}</span></div>
        <a href="#" class="btn-buy" onclick="handleAddToCart(event, '${p.id}')">Comprar</a>
      </div>
    </div>
  `;
}

async function renderGrids() {
  const grids = ['grid-mais-vendidos', 'grid-ignite', 'grid-todos'];
  grids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<div class="loading-status">Buscando produtos no banco...</div>';
  });

  products = await fetchProducts();
  
  if (products.length === 0) {
    grids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<div class="error-status">Nenhum produto encontrado no banco. Verifique sua tabela no Supabase.</div>';
    });
    return;
  }

  const gridData = { 
    'grid-mais-vendidos': products.slice(0, 4), 
    'grid-ignite': products.filter(p => p.name?.toLowerCase().includes('ignite')), 
    'grid-todos': products 
  };

  for (const [id, list] of Object.entries(gridData)) {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = list.length > 0 
        ? list.map(createProductCard).join('') 
        : '<div class="error-status">Nenhum produto nesta categoria.</div>';
    }
  }
}

async function renderCatalogGrid() {
  products = await fetchProducts();
  const grid = document.getElementById('grid-catalog');
  if (grid) grid.innerHTML = products.map(createProductCard).join('');
  setupNavLinks();
}

async function setupProductDetailsLogic(id) {
  const { data: p } = await supabase.from('products').select('*').eq('id', id).single();
  if (!p) return;
  const imgSrc = p.img.startsWith('http') ? p.img : (p.img.startsWith('/') ? p.img : '/' + p.img);
  document.getElementById('detail-img').src = imgSrc;
  document.getElementById('detail-name').textContent = p.name;
  document.getElementById('detail-category').textContent = p.category;
  document.getElementById('detail-price').textContent = `R$ ${p.price.toFixed(2)}`;
  document.getElementById('add-to-cart-btn').onclick = (e) => handleAddToCart(e, p.id);
}

function renderCategories() {
  const menu = document.getElementById('category-menu');
  if (!menu) return;
  const cats = ['Elfbar', 'Nikbar', 'Ignite', 'Todos'];
  menu.innerHTML = cats.map(c => `<li><a href="#" class="nav-link">${c}</a></li>`).join('');
}

window.handleAddToCart = (e, id) => {
  e.preventDefault();
  const p = products.find(p => String(p.id) === String(id));
  if (p) { cart.push(p); localStorage.setItem('smokers-cart', JSON.stringify(cart)); updateCartUI(); alert('Adicionado!'); }
};

function updateCartUI() {
  const count = document.querySelector('.cart-count');
  if (count) count.textContent = cart.length;
}

window.handleLogout = async (e) => {
  if (e) e.preventDefault();
  await supabase.auth.signOut();
  const dropdown = document.getElementById('user-dropdown');
  if(dropdown) dropdown.classList.remove('show');
  navigate('/');
};

async function setupLoginLogic() {
  const form = document.getElementById('login-form');
  if (!form) return;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert('Erro no login: ' + error.message);
    else { alert('Bem-vindo!'); navigate('/'); }
  };
}

async function setupRegisterLogic() {
  const form = document.getElementById('register-form');
  const cpfInput = document.getElementById('cpf');
  if (!form) return;

  if (cpfInput) {
    cpfInput.oninput = (e) => {
      let v = e.target.value.replace(/\D/g, "");
      if (v.length > 11) v = v.substring(0, 11);
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      e.target.value = v;
    };
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const full_name = e.target.name.value;
    const cpf = e.target.cpf.value;

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { full_name, cpf } }
    });
    if (error) alert('Erro no registro: ' + error.message);
    else alert('Conta criada! Verifique seu e-mail.');
  };
}

document.addEventListener('DOMContentLoaded', async () => { 
  await setupAuth();
  handleRoute(); 
  updateCartUI(); 
});
