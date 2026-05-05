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

// --- STATE ---
let products = [];
let cart = JSON.parse(localStorage.getItem('smokers-cart')) || [];

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
  '/produto': ProductDetails
};

window.navigate = navigate;

async function navigate(path) {
  window.history.pushState({}, '', path);
  await handleRoute();
}

async function handleRoute() {
  const path = window.location.pathname;
  const app = document.getElementById('app');
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
  const { data, error } = await supabase.from('products').select('*').eq('is_active', true);
  return data || [];
}

function createProductCard(p) {
  return `
    <div class="product-card">
      ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
      <a href="/produto/${p.id}" class="card-img-wrap nav-link"><img src="${p.img}"></a>
      <div class="card-info">
        <a href="/produto/${p.id}" class="card-name nav-link">${p.name}</a>
        <div class="card-price-row"><span class="price-current">R$ ${p.price.toFixed(2)}</span></div>
        <a href="#" class="btn-buy" onclick="handleAddToCart(event, '${p.id}')">Comprar</a>
      </div>
    </div>
  `;
}

async function renderGrids() {
  products = await fetchProducts();
  const grids = { 'grid-mais-vendidos': products.slice(0, 4), 'grid-ignite': products.filter(p => p.name.includes('Ignite')), 'grid-todos': products };
  for (const [id, list] of Object.entries(grids)) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = list.map(createProductCard).join('');
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
  document.getElementById('detail-img').src = p.img;
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

window.handleLogout = async () => { await supabase.auth.signOut(); navigate('/'); };

document.addEventListener('DOMContentLoaded', () => { handleRoute(); updateCartUI(); });
