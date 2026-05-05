export const Account = (subpage = 'perfil') => {
  return `
    <div class="container" style="padding: 60px 0;">
      <div style="display: grid; grid-template-columns: 280px 1fr; gap: 40px;">
        <aside style="background: var(--bg-dark); border: 1px solid var(--border); border-radius: 20px; padding: 20px;">
          <ul style="display: flex; flex-direction: column; gap: 10px;">
            <li><a href="/minha-conta/perfil" class="nav-link" style="display:block; padding: 12px; ${subpage==='perfil'?'background: var(--purple);':''}">Perfil</a></li>
            <li><a href="/minha-conta/pedidos" class="nav-link" style="display:block; padding: 12px; ${subpage==='pedidos'?'background: var(--purple);':''}">Pedidos</a></li>
            <li style="margin-top: 20px;"><button onclick="handleLogout()" style="color: var(--pink);">Sair</button></li>
          </ul>
        </aside>
        <main><div class="account-card"><h3>${subpage.toUpperCase()}</h3><p style="margin-top:20px; color:var(--gray);">Funcionalidade em desenvolvimento.</p></div></main>
      </div>
    </div>
  `;
};
