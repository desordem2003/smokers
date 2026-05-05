export const Register = () => {
  return `
    <div class="auth-container">
      <div class="auth-card" style="max-width: 600px;">
        <div class="auth-header"><h2>Criar <span>Conta</span></h2><p>Junte-se ao clube SMOKE/RS</p></div>
        <form class="auth-form" id="register-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group"><label>Nome</label><input type="text" id="name" name="name" autocomplete="name" required></div>
            <div class="form-group"><label>E-mail</label><input type="email" id="email" name="email" autocomplete="email" required></div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group"><label>CPF</label><input type="text" id="cpf" placeholder="000.000.000-00" maxlength="14" required></div>
            <div class="form-group">
              <label>Senha</label>
              <input type="password" id="password" minlength="8" maxlength="32" required>
              <small style="color: #94a3b8; font-size: 0.7rem; display: block; margin-top: 5px;">De 8 a 32 caracteres</small>
            </div>
          </div>
          <button type="submit" class="btn-auth">Criar Conta</button>
        </form>
        <div class="auth-footer"><p>Já tem conta? <a href="/login" class="nav-link">Faça login</a></p></div>
      </div>
    </div>
  `;
};
