/* =============================================
   SMOKE/RS - LOGIC
   ============================================= */

const products = [
  { id: 1, category: 'pod', name: 'Ignite V50 Watermelon Ice', price: 129.90, oldPrice: 159.90, img: 'assets/pod_product.png', badge: '15% OFF' },
  { id: 2, category: 'pod', name: 'Elfbar BC5000 Blue Razz', price: 119.90, oldPrice: 139.90, img: 'assets/pod_product.png', badge: 'NOVO' },
  { id: 3, category: 'pod', name: 'Oxbar G8000 Mango Ice', price: 139.90, oldPrice: 169.90, img: 'assets/pod_product.png', badge: 'PROMO' },
  { id: 4, category: 'pod', name: 'Nikbar 6000 Puffs Strawberry', price: 109.90, oldPrice: null, img: 'assets/pod_product.png', badge: null },
  { id: 5, category: 'vape', name: 'Vaporesso XROS 3 Nano', price: 289.90, oldPrice: 329.90, img: 'assets/vape_device_hero.png', badge: 'TOP' },
  { id: 6, category: 'vape', name: 'Geekvape L200 Kit', price: 549.90, oldPrice: 599.90, img: 'assets/vape_device_hero.png', badge: 'PRO' },
  { id: 7, category: 'essencia', name: 'Juice BLVK Pink 60ml', price: 79.90, oldPrice: 99.90, img: 'assets/eliquid_product.png', badge: null },
  { id: 8, category: 'essencia', name: 'Nasty Juice Cush Man', price: 89.90, oldPrice: null, img: 'assets/eliquid_product.png', badge: 'HOT' }
];

function createProductCard(p) {
  return `
    <div class="product-card">
      ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
      <div class="card-img-wrap">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
      </div>
      <div class="card-info">
        <h3 class="card-name">${p.name}</h3>
        <div class="card-price-row">
          ${p.oldPrice ? `<span class="price-old">R$ ${p.oldPrice.toFixed(2)}</span>` : ''}
          <span class="price-current">R$ ${p.price.toFixed(2)}</span>
        </div>
        <a href="#" class="btn-buy" onclick="addToCart(event, ${p.id})">Comprar Agora</a>
      </div>
    </div>
  `;
}

function renderGrids() {
  const grids = {
    'grid-mais-vendidos': products.slice(0, 4),
    'grid-ignite': products.filter(p => p.name.includes('Ignite')),
    'grid-todos': products
  };

  for (const [id, list] of Object.entries(grids)) {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = list.map(createProductCard).join('');
    }
  }
}

let cartCount = 0;
window.addToCart = function(e, id) {
  e.preventDefault();
  cartCount++;
  const counter = document.querySelector('.cart-count');
  if (counter) {
    counter.textContent = cartCount;
    counter.style.transform = 'scale(1.2)';
    setTimeout(() => counter.style.transform = 'scale(1)', 200);
  }
  alert('Produto adicionado ao carrinho!');
};

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  renderGrids();
});
