export const Login = () => {
  return `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Bem-vindo <span>de volta</span></h2>
          <p>Acesse sua conta para gerenciar seus pedidos</p>
        </div>
        <form class="auth-form" id="login-form">
          <div class="form-group"><label>E-mail</label><input type="email" id="email" name="email" autocomplete="email" required></div>
          <div class="form-group"><label>Senha</label><input type="password" id="password" name="password" autocomplete="current-password" required></div>
          <div class="form-options">
            <label><input type="checkbox"> Lembrar-me</label>
            <a href="/recuperar-senha" class="nav-link">Esqueceu a senha?</a>
          </div>
          <button type="submit" class="btn-auth">Entrar</button>
        </form>
        <div class="auth-footer"><p>Não tem conta? <a href="/registro" class="nav-link">Criar nova conta</a></p></div>
      </div>
    </div>
  `;
};
