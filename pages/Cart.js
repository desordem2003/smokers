export const Cart = () => {
  const cart = JSON.parse(localStorage.getItem('smokers-cart')) || [];
  const subtotal = cart.reduce((sum, i) => sum + i.price, 0);
  return `
    <div class="container" style="padding: 60px 0;">
      <h2 class="section-title" style="text-align: left;">Meu <span>Carrinho</span></h2>
      <div class="cart-layout" style="display: grid; grid-template-columns: 1fr 350px; gap: 40px; margin-top: 40px;">
        <div class="cart-items">
          ${cart.length === 0 ? '<p style="color: var(--gray);">Seu carrinho está vazio.</p>' : cart.map(item => `<div style="display: flex; align-items: center; gap: 20px; background: var(--bg-dark); padding: 20px; border-radius: 20px; margin-bottom: 20px;"><img src="${item.img}" style="width: 80px;"><div><h4>${item.name}</h4><p style="color: var(--purple);">R$ ${item.price.toFixed(2)}</p></div></div>`).join('')}
        </div>
        <div class="cart-summary" style="background: var(--bg-dark); border-radius: 24px; padding: 30px; height: fit-content;">
          <h3>Resumo</h3><div style="display: flex; justify-content: space-between; margin: 20px 0;"><span>Subtotal</span><span>R$ ${subtotal.toFixed(2)}</span></div>
          <button onclick="navigate('/checkout/1')" class="btn-auth" style="width: 100%; margin: 0;">Finalizar Compra</button>
        </div>
      </div>
    </div>
  `;
};
