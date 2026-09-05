-- =========================================================
-- Marrooks — schema do banco
-- Idempotente: pode ser executado várias vezes sem quebrar.
--
-- NÃO passe este arquivo por formatador de SQL automático:
-- o corpo da função no fim é uma string literal e formatadores
-- costumam quebrá-la.
-- =========================================================

-- ---------- Catálogo ----------

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  short_description TEXT,
  description   TEXT,
  price         NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  compare_price NUMERIC(10, 2) CHECK (compare_price >= 0),
  stock         INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  featured      BOOLEAN NOT NULL DEFAULT FALSE,
  category_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,

  -- Dimensões usadas na cotação de frete (cm) e peso (kg).
  -- ATENÇÃO: valores reais por item, não placeholders.
  width         NUMERIC(6, 2) NOT NULL DEFAULT 11,
  height        NUMERIC(6, 2) NOT NULL DEFAULT 2,
  length        NUMERIC(6, 2) NOT NULL DEFAULT 16,
  weight        NUMERIC(6, 3) NOT NULL DEFAULT 0.05,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

CREATE TABLE IF NOT EXISTS product_images (
  id         SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt        TEXT,
  position   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- ---------- Usuários ----------

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone         TEXT,
  document      TEXT,
  role          TEXT NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS addresses (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       TEXT,
  postal_code TEXT NOT NULL,
  street      TEXT NOT NULL,
  number      TEXT NOT NULL,
  complement  TEXT,
  district    TEXT NOT NULL,
  city        TEXT NOT NULL,
  state       CHAR(2) NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- ---------- Pedidos ----------

CREATE TABLE IF NOT EXISTS orders (
  id                 SERIAL PRIMARY KEY,
  reference          TEXT NOT NULL UNIQUE,
  user_id            INTEGER REFERENCES users(id) ON DELETE SET NULL,

  status             TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled')),

  subtotal           NUMERIC(10, 2) NOT NULL,
  shipping_cost      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total              NUMERIC(10, 2) NOT NULL,

  -- Snapshot do contato e do endereço no momento da compra
  customer_name      TEXT NOT NULL,
  customer_email     TEXT NOT NULL,
  customer_phone     TEXT,
  customer_document  TEXT,
  shipping_postal_code TEXT NOT NULL,
  shipping_street    TEXT NOT NULL,
  shipping_number    TEXT NOT NULL,
  shipping_complement TEXT,
  shipping_district  TEXT NOT NULL,
  shipping_city      TEXT NOT NULL,
  shipping_state     CHAR(2) NOT NULL,

  -- Frete escolhido
  shipping_service_id   TEXT,
  shipping_service_name TEXT,
  shipping_company      TEXT,
  shipping_deadline     INTEGER,
  tracking_code         TEXT,

  -- Pagamento
  payment_id         TEXT,
  payment_status     TEXT,
  payment_method     TEXT,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id           SERIAL PRIMARY KEY,
  order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   INTEGER REFERENCES products(id) ON DELETE SET NULL,

  -- Snapshot: o pedido não muda se o produto for editado/removido depois
  product_name TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  unit_price   NUMERIC(10, 2) NOT NULL,
  quantity     INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ---------- updated_at automático ----------
-- Corpo em aspas simples (e não $$) de propósito: sobrevive a
-- formatadores de SQL e a clientes que dividem o script por ";".

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql
AS 'BEGIN NEW.updated_at = NOW(); RETURN NEW; END;';

DROP TRIGGER IF EXISTS products_set_updated_at ON products;
CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS orders_set_updated_at ON orders;
CREATE TRIGGER orders_set_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();