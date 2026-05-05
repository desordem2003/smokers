export const ProductDetails = async (id) => {
  return `
    <div class="container">
      <div class="product-details-layout" style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; padding: 60px 0;">
        <div class="product-gallery"><div class="main-img" style="background: var(--bg-dark); border: 1px solid var(--border); border-radius: 30px; display: flex; align-items: center; justify-content: center; aspect-ratio: 1;"><img id="detail-img" src="" style="max-width: 80%;"></div></div>
        <div class="product-info-panel">
          <h1 id="detail-name" style="font-family: 'Syne', sans-serif; font-size: 3rem; margin-bottom: 10px;"></h1>
          <p id="detail-category" style="color: var(--gray); margin-bottom: 30px;"></p>
          <div class="detail-price-box" style="margin-bottom: 40px;"><span id="detail-price" style="font-size: 3rem; font-weight: 800; color: var(--purple);"></span></div>
          <div class="purchase-actions" style="display: flex; gap: 20px;">
            <input type="number" id="qty" value="1" style="width: 60px; background: var(--bg-dark); color: white; border: 1px solid var(--border); border-radius: 10px; padding: 10px; text-align: center;">
            <button id="add-to-cart-btn" class="btn-auth" style="flex-grow: 1; margin: 0;">Adicionar ao Carrinho</button>
          </div>
        </div>
      </div>
    </div>
  `;
};
