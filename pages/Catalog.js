export const Catalog = async () => {
  return `
    <div class="container">
      <div class="catalog-container">
        <aside class="filters-sidebar">
          <div class="filter-group"><h3>Categorias</h3><div class="filter-options"><label class="filter-option"><input type="checkbox" value="pod"> Pods</label><label class="filter-option"><input type="checkbox" value="vape"> Vapes</label></div></div>
          <div class="filter-group"><h3>Preço</h3><div class="filter-options"><label class="filter-option"><input type="radio" name="price" value="0-100"> Até R$ 100</label><label class="filter-option"><input type="radio" name="price" value="100+"> Acima de R$ 100</label></div></div>
        </aside>
        <main class="catalog-main">
          <div class="catalog-header"><h2>Todos os <span>Produtos</span></h2></div>
          <div class="products-grid" id="grid-catalog">Carregando catálogo...</div>
        </main>
      </div>
    </div>
  `;
};
