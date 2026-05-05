export const Checkout = (step) => {
  return `
    <div class="container" style="padding: 60px 0;">
      <h3>Checkout - Passo ${step}</h3>
      <p style="margin-top:20px;">Em desenvolvimento...</p>
      <button onclick="navigate('/checkout/${parseInt(step)+1}')" class="btn-auth" style="margin-top:20px;">Continuar</button>
    </div>
  `;
};
