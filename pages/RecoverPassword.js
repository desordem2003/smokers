export const RecoverPassword = () => {
  return `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header"><h2>Recuperar <span>Senha</span></h2><p>Enviaremos um link de redefinição para seu e-mail</p></div>
        <form class="auth-form" id="recover-form">
          <div class="form-group"><label>E-mail</label><input type="email" id="email" required></div>
          <button type="submit" class="btn-auth">Enviar Link</button>
        </form>
        <div class="auth-footer"><p><a href="/login" class="nav-link">Voltar para Login</a></p></div>
      </div>
    </div>
  `;
};
