import { supabase } from '../supabase.js'

export const Admin = async (subpage = 'dashboard') => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No session');

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.is_admin !== true) {
      throw new Error('Not admin');
    }
  } catch (error) {
    // Retorna string vazia ou html simulando que a página não existe
    // Sem revelar que é área restrita
    return `<div style="min-height: 100vh; background: #fff;"></div>`; 
  }

  const renderContent = async () => {
    switch(subpage) {
      case 'dashboard': return `<div class="admin-stats" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 30px;"><div style="background: var(--bg-dark); padding: 25px; border-radius: 20px; border: 1px solid var(--border);"><p style="color: var(--gray);">Vendas</p><h4 style="font-size: 1.8rem; color: var(--purple);">R$ 12.450</h4></div></div>`;
      case 'produtos': 
        const { data: prods } = await supabase.from('products').select('*');
        return `<div style="margin-top: 30px;"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;"><h3>Produtos</h3><button onclick="navigate('/admin/produtos/novo')" class="btn-auth" style="padding: 10px 20px; margin: 0;">+ Novo</button></div><div style="background: var(--bg-dark); border: 1px solid var(--border); border-radius: 20px; overflow: hidden;"><table style="width: 100%; text-align: left;"><thead style="background: rgba(255,255,255,0.05);"><tr><th style="padding: 15px;">Nome</th><th style="padding: 15px;">Preço</th><th style="padding: 15px;">Ações</th></tr></thead><tbody>${prods?.map(p => `<tr style="border-top: 1px solid var(--border);"><td style="padding: 15px;">${p.name}</td><td style="padding: 15px;">R$ ${p.price.toFixed(2)}</td><td style="padding: 15px;"><button onclick="navigate('/admin/produtos/${p.id}')" style="color: var(--purple);">Editar</button></td></tr>`).join('') || ''}</tbody></table></div></div>`;
      default: return '';
    }
  };
  return `<div class="container" style="padding: 60px 0;"><div style="display: grid; grid-template-columns: 240px 1fr; gap: 40px;"><aside style="background: var(--bg-dark); border: 1px solid var(--border); border-radius: 20px; padding: 20px;"><h2 style="font-size: 1.2rem; margin-bottom: 30px;">Painel Admin</h2><ul style="display: flex; flex-direction: column; gap: 10px;"><li><a href="/admin/dashboard" class="nav-link" style="display:block; padding: 12px; ${subpage==='dashboard'?'background: var(--purple);':''}">Dashboard</a></li><li><a href="/admin/produtos" class="nav-link" style="display:block; padding: 12px; ${subpage==='produtos'?'background: var(--purple);':''}">Produtos</a></li></ul></aside><main>${await renderContent()}</main></div></div>`;
};
