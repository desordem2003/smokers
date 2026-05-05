export const Register = () => {
  return `
    <div class="auth-container">
      <div class="auth-card" style="max-width: 600px;">
        <div class="auth-header"><h2>Criar <span>Conta</span></h2><p>Junte-se ao clube SMOKE/RS</p></div>
        <form class="auth-form" id="register-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group"><label>Nome</label><input type="text" id="name" required></div>
            <div class="form-group"><label>E-mail</label><input type="email" id="email" required></div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group"><label>CPF</label><input type="text" id="cpf" required></div>
            <div class="form-group"><label>Senha</label><input type="password" id="password" required></div>
          </div>
          <button type="submit" class="btn-auth">Criar Conta</button>
        </form>
        <div class="auth-footer"><p>Já tem conta? <a href="/login" class="nav-link">Faça login</a></p></div>
      </div>
    </div>
  `;
};
