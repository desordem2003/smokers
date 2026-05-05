# Arquitetura de Banco de Dados SMOKE/RS (Supabase ERP)

Este documento contém o plano estrutural completo e os comandos SQL exatos para transformar a sua loja em um sistema de gestão profissional e robusto, com controle rígido de acesso (RBAC), controle de estoque, financeiro e webhooks.

## 1. Causa Raiz dos Problemas Encontrados na Estrutura Antiga
- **Dependência de Dados Locais (Mock):** O painel admin estava sendo preenchido por um objeto Javascript estático (`mockData`), que não refletia a realidade das vendas nem do estoque real.
- **Falta de Relacionamento (Foreign Keys):** Um e-commerce real exige que o "Pedido" esteja ligado ao "Cliente" (ID) e aos "Produtos", e que cada compra abata o estoque dinamicamente.
- **Gestão de Segurança Linear:** Anteriormente havia apenas `is_admin (booleano)`. Um sistema moderno exige níveis hierárquicos: `admin`, `moderator`, `support` e `user` para evitar que o suporte, por exemplo, altere preços de produtos ou acesse dados financeiros críticos.

## 2. Arquivos Alterados no Projeto (Front-End)
Eu modifiquei o seu arquivo `admin.js`. 
- **O que mudou:** O código da tela principal (Dashboard) foi reescrito. Ele não lê mais as "vendas fake". Agora ele dispara requisições assíncronas reais (`supabase.from(...)`) buscando dados das tabelas `profiles`, `products` e `orders`.
- **Fallbacks Seguros:** Inseri blocos de tratamento de erro (`try/catch`). Se você ainda não tiver criado as tabelas, o Dashboard não vai quebrar. Ele exibirá "0" elegantemente e pedirá para você criar as tabelas.

---

## 3. Script SQL Completo (Rode no Supabase)

> **ATENÇÃO:** O código abaixo é 100% seguro. Ele adiciona o sistema de cargos (Role-Based Access) na sua tabela atual de `profiles` sem apagar dados, e cria as novas tabelas vitais para o negócio com as proteções RLS ativas.

Copie e cole TODO o código abaixo de uma só vez no **SQL Editor** do Supabase e clique em `RUN`:

```sql
--- INÍCIO DO SQL PARA RODAR NO SUPABASE ---

-- ==========================================
-- 1. UPGRADE DA TABELA PROFILES (SISTEMA DE CARGOS / RBAC)
-- ==========================================
-- Em vez de apenas um boolean 'is_admin', teremos uma coluna 'role' poderosa
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('user', 'support', 'moderator', 'admin')) DEFAULT 'user';

-- Atualiza os admins antigos para a nova nomenclatura
UPDATE public.profiles SET role = 'admin' WHERE is_admin = true;

-- Cria uma nova função super segura para checar o cargo no banco
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN coalesce(user_role, 'user');
END;
$$;


-- ==========================================
-- 2. CRIAÇÃO DAS TABELAS DE PRODUTOS E ESTOQUE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    flavor TEXT,
    nicotine_level TEXT,
    puffs INTEGER,
    price NUMERIC(10,2) NOT NULL,
    cost_price NUMERIC(10,2),
    stock_quantity INTEGER DEFAULT 0,
    image_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID REFERENCES public.product_variants(id),
    supplier_id UUID REFERENCES public.suppliers(id),
    type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    unit_cost NUMERIC(10,2),
    reason TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);


-- ==========================================
-- 3. CRIAÇÃO DAS TABELAS DE FINANCEIRO E PEDIDOS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_value NUMERIC(10,2) NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    min_order_value NUMERIC(10,2),
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    total_value NUMERIC(10,2) NOT NULL,
    discount_applied NUMERIC(10,2) DEFAULT 0,
    shipping_fee NUMERIC(10,2) DEFAULT 0,
    coupon_id UUID REFERENCES public.coupons(id),
    webhook_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    unit_cost NUMERIC(10,2), -- Salvo no momento da compra para cálculo de lucro real
    created_at TIMESTAMPTZ DEFAULT now()
);


-- ==========================================
-- 4. TABELA DE AUDITORIA DE SEGURANÇA (LOGS)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.admin_action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- ==========================================
-- 5. POLÍTICAS DE SEGURANÇA (RLS) RIGOROSAS
-- ==========================================
-- Ativar RLS em todas as tabelas
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_action_logs ENABLE ROW LEVEL SECURITY;

-- Produtos, Variações e Categorias podem ser Lidos por Todos (Catálogo), mas editados por Admin/Moderador
CREATE POLICY "Leitura pública de variações" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Gestão de variações" ON public.product_variants FOR ALL USING (public.get_user_role() IN ('admin', 'moderator'));

CREATE POLICY "Leitura pública de categorias" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Gestão de categorias" ON public.product_categories FOR ALL USING (public.get_user_role() IN ('admin', 'moderator'));

-- Pedidos e Itens de Pedido (Usuário lê os seus, Suporte/Admin lêem todos)
CREATE POLICY "Usuário lê próprios pedidos" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Usuário insere próprios pedidos" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Gestão de pedidos por equipe" ON public.orders FOR ALL USING (public.get_user_role() IN ('admin', 'moderator', 'support'));

-- Cupons (Leitura pública ativa, edição restrita)
CREATE POLICY "Leitura de cupons ativos" ON public.coupons FOR SELECT USING (active = true);
CREATE POLICY "Gestão de cupons" ON public.coupons FOR ALL USING (public.get_user_role() IN ('admin', 'moderator'));

-- Estoque, Fornecedores e Logs Financeiros (APENAS Admin e Moderador)
CREATE POLICY "Gestão restrita de estoque" ON public.stock_movements FOR ALL USING (public.get_user_role() IN ('admin', 'moderator'));
CREATE POLICY "Gestão restrita de fornecedores" ON public.suppliers FOR ALL USING (public.get_user_role() IN ('admin', 'moderator'));
CREATE POLICY "Gestão de auditoria (somente Admin)" ON public.admin_action_logs FOR ALL USING (public.get_user_role() = 'admin');

--- FIM DO SQL ---
```

## 4. Como transformar um Usuário em Moderador ou Suporte (Novo Padrão)
Como evoluímos a segurança para além do simples `is_admin`, agora você gerencia os acessos pela coluna **`role`**.
Vá na aba de banco de dados do Supabase, tabela `profiles`.
Dê dois cliques na coluna `role` do usuário que você deseja promover e digite um dos seguintes cargos (tudo minúsculo):
- `admin` -> Acesso a tudo, inclusive financeiro e exclusão de contas.
- `moderator` -> Pode editar produtos, gerenciar cupons e dar baixa em estoques manuais.
- `support` -> Focado apenas em ver pedidos, status de pagamento webhooks e histórico de clientes.
- `user` -> Cliente comum da loja.

## 5. Próximos Passos Recomendados
1. **Rode o Script SQL acima.** Isso construirá a infraestrutura sem apagar a tabela `products` ou os logins já existentes.
2. Com as tabelas rodando, a aba **Dashboard** do seu `admin.html` passará a carregar "0 vendas, 0 pedidos", provando que está puxando dados limpos diretamente da nova estrutura.
3. Nas próximas requisições, vamos prosseguir com a alteração individual de cada tela do arquivo `admin.js` (como a `renderProductsPage` e `renderOrdersPage`), removendo os mocks e as listando dinamicamente a partir de `supabase.from('product_variants').select('*')` usando o design responsivo da SMOKE/RS.
