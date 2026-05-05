export const ResetPassword = () => {
  return `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header"><h2>Redefinir <span>Senha</span></h2><p>Digite sua nova senha abaixo</p></div>
        <form class="auth-form" id="reset-form">
          <div class="form-group"><label>Nova Senha</label><input type="password" id="new-password" required></div>
          <button type="submit" class="btn-auth">Salvar Senha</button>
        </form>
      </div>
    </div>
  `;
};
