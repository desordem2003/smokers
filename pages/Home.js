export const Home = async () => {
  return `
    <section id="hero">
      <div class="hero-image-container">
        <img src="assets/hero_banner.jpg" alt="SMOKE/RS Hero" class="hero-bg-img">
        <div class="hero-overlay"></div>
        <div class="hero-info-bar">
          <div class="container info-flex">
            <div class="info-item"><span>MELHOR FORNECEDOR DO ESTADO E REGIÕES</span></div>
            <div class="cities-list">
              <span>PORTO ALEGRE</span> • <span>CAXIAS DO SUL</span> • <span>PELOTAS</span> • <span>SANTA MARIA</span> • <span>PASSO FUNDO</span> • <span>SANTA CRUZ DO SUL</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    <main class="container">
      <section class="products-section" id="mais-vendidos">
        <div class="section-header"><h2>Mais <span>Vendidos</span></h2></div>
        <div class="products-grid" id="grid-mais-vendidos">Carregando...</div>
      </section>
      <section class="products-section" id="ignite">
        <div class="section-header"><h2>Ignite</h2></div>
        <div class="products-grid" id="grid-ignite">Carregando...</div>
      </section>
      <section class="products-section" id="todos">
        <div class="section-header"><h2>Todos os <span>Produtos</span></h2></div>
        <div class="products-grid" id="grid-todos">Carregando...</div>
      </section>
    </main>
  `;
};
