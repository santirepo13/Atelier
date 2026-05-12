-- ============================================================
-- ATELIER Database Schema
-- PostgreSQL initialization script
-- Based on SRS.md Section 14.2 Data Dictionary
-- ============================================================

-- Drop existing tables (for clean reinstall)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- Table: users
-- Firebase UID, username, email, security question/answer
-- SRS: Section 14.2, Data Dictionary
-- ============================================================
CREATE TABLE users (
    uid             VARCHAR(128) PRIMARY KEY,
    username        VARCHAR(50) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    clave_tipo      INTEGER NOT NULL CHECK (clave_tipo IN (1, 2, 3)),
    clave_respuesta VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_uid ON users(uid);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

COMMENT ON TABLE users IS 'User profiles linked to Firebase Auth UID';
COMMENT ON COLUMN users.clave_tipo IS 'Security question type: 1=Madre, 2=Mascota, 3=Color';

-- ============================================================
-- Table: products
-- Product catalog: name, price, image, description
-- SRS: Section 14.2, Data Dictionary
-- ============================================================
CREATE TABLE products (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(200) NOT NULL,
    precio      INTEGER NOT NULL CHECK (precio >= 0),
    imagen      VARCHAR(500) NOT NULL,
    descripcion TEXT,
    categoria   VARCHAR(100),
    stock       INTEGER DEFAULT 0 CHECK (stock >= 0),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_categoria ON products(categoria);
CREATE INDEX idx_products_precio ON products(precio);

COMMENT ON TABLE products IS 'Product catalog stored in PostgreSQL per FR-003';
COMMENT ON COLUMN products.precio IS 'Price in Colombian Pesos (COP) — no decimals';

-- ============================================================
-- Table: cart_items
-- User's active shopping cart entries
-- SRS: Section 14.2, Data Dictionary
-- FK: user_id → users.uid (CASCADE DELETE)
-- FK: product_id → products.id (CASCADE DELETE)
-- ============================================================
CREATE TABLE cart_items (
    id          SERIAL PRIMARY KEY,
    user_id     VARCHAR(128) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity    INTEGER NOT NULL CHECK (quantity >= 1),
    added_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, product_id)
);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

COMMENT ON TABLE cart_items IS 'Active shopping cart per user per product per BR-004';
COMMENT ON COLUMN cart_items.quantity IS 'Must be >= 1 per VAL-003 and BR-005';
COMMENT ON COLUMN cart_items.user_id IS 'Firebase UID from verified token per BR-001';

-- ============================================================
-- Table: orders
-- Purchase history headers
-- SRS: Section 14.2, Data Dictionary
-- ============================================================
CREATE TABLE orders (
    id              SERIAL PRIMARY KEY,
    user_id         VARCHAR(128) NOT NULL REFERENCES users(uid),
    total           INTEGER NOT NULL CHECK (total >= 0),
    payment_method  VARCHAR(50) NOT NULL CHECK (payment_method IN ('card', 'PSE', 'Efecty')),
    status          VARCHAR(50) NOT NULL DEFAULT 'pending',
    fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_fecha ON orders(fecha);
CREATE INDEX idx_orders_status ON orders(status);

COMMENT ON TABLE orders IS 'Order headers per FR-006 atomic transaction';
COMMENT ON COLUMN orders.payment_method IS 'Simulated Colombian payment per BR-010';

-- ============================================================
-- Table: order_items
-- Line items for each order (denormalized product snapshot)
-- SRS: Section 14.2, Data Dictionary
-- FK: order_id → orders.id (CASCADE DELETE)
-- FK: product_id → products.id
-- ============================================================
CREATE TABLE order_items (
    id              SERIAL PRIMARY KEY,
    order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      INTEGER NOT NULL REFERENCES products(id),
    product_name    VARCHAR(200) NOT NULL,
    product_price   INTEGER NOT NULL,
    quantity        INTEGER NOT NULL CHECK (quantity >= 1)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

COMMENT ON TABLE order_items IS 'Denormalized order line items per BR-007';
COMMENT ON COLUMN order_items.product_name IS 'Product name snapshot at time of purchase';
COMMENT ON COLUMN order_items.product_price IS 'Price snapshot at time of purchase in COP';

-- ============================================================
-- Sample Data: 5 products (admin seed)
-- Matches database/adminQueries/products_insert.sql
-- ============================================================
INSERT INTO products (nombre, precio, imagen, descripcion, categoria, stock) VALUES
('Cojín Artesanal Tejido', 85000, 'img/cojin1.jpg', 'Cojín tejido a mano por artesanos de Nariño. Patrón tradicional combinado con colores vibrantes.', 'Decoración', 15),
('Vela Aromática Sábila', 45000, 'img/vela1.jpg', 'Vela de cera natural con aroma de sábila. Producción artesanal con aceites esenciales.', 'Cosmética', 30),
('Frasco de Miel Silvestre', 35000, 'img/miel1.jpg', 'Miel pura de apicultores del Eje Cafetero. Recolectada de forma sostenible.', 'Alimentación', 25),
('Bolso de Cumare', 120000, 'img/bolso1.jpg', 'Bolso tejido con fibra de cumare por comunidades del Magdalena Medio.', 'Accesorios', 8),
('Cerámica Raku Tradicional', 180000, 'img/ceramica1.jpg', 'Pieza de cerámica procesada con técnica Raku. Cada pieza es única y decorada a mano.', 'Decoración', 5);

-- ============================================================
-- Indexes for foreign key performance (PERF-003)
-- ============================================================
CREATE INDEX idx_cart_items_composite ON cart_items(user_id, product_id);
CREATE INDEX idx_order_items_composite ON order_items(order_id, product_id);
CREATE INDEX idx_orders_user_fecha ON orders(user_id, fecha DESC);

-- ============================================================
-- Sequence owners (for SERIAL columns)
-- ============================================================
ALTER SEQUENCE products_id_seq RESTART WITH 6;
ALTER SEQUENCE cart_items_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;