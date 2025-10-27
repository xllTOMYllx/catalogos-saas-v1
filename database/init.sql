-- Catalogos SaaS v1 - PostgreSQL Database Schema and Initial Data
-- This script creates the database, tables, and inserts initial test data

-- Create database (run this separately if needed)
-- CREATE DATABASE catalogos_saas;

-- Connect to the database
-- \c catalogos_saas;

-- Table: users
-- Stores user authentication and basic information
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    nombre VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: clients
-- Stores business/client information for customizing catalogs
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    logo VARCHAR(500),
    color VARCHAR(7) DEFAULT '#f24427',
    telefono VARCHAR(20),
    direccion TEXT,
    descripcion TEXT,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: products
-- Stores product catalog information
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    ruta VARCHAR(500) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: catalogs
-- Links clients with products (many-to-many relationship)
-- Allows clients to have their own customized product catalogs
CREATE TABLE IF NOT EXISTS catalogs (
    id SERIAL PRIMARY KEY,
    "clientId" INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    "productId" INTEGER REFERENCES products(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT true,
    "customPrice" DECIMAL(10, 2),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("clientId", "productId")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_clients_userId ON clients("userId");
CREATE INDEX IF NOT EXISTS idx_catalogs_clientId ON catalogs("clientId");
CREATE INDEX IF NOT EXISTS idx_catalogs_productId ON catalogs("productId");
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Insert initial test users
INSERT INTO users (email, password, role, nombre) VALUES
    ('admin@test.com', '123', 'admin', 'Administrador'),
    ('user@test.com', '123', 'user', 'Usuario Demo'),
    ('client@test.com', '123', 'client', 'Cliente Demo')
ON CONFLICT (email) DO NOTHING;

-- Insert initial client/business (for backward compatibility with business endpoint)
INSERT INTO clients (id, nombre, logo, color, telefono, "userId", descripcion) VALUES
    (1, 'UrbanStreet', '/logosinfondo.png', '#f24427', '1234567890', 
     (SELECT id FROM users WHERE email = 'admin@test.com'), 
     'Tienda de ropa urbana y accesorios')
ON CONFLICT (id) DO NOTHING;

-- Insert initial products
INSERT INTO products (ruta, nombre, precio, description, stock, category) VALUES
    ('/products/cap2.png', 'Gorra número 2', 399.00, 'Gorra urbana clásica', 50, 'Accesorios'),
    ('/products/shirt1.png', 'Camisa número 1', 399.00, 'Camisa streetwear', 30, 'Ropa'),
    ('/products/gorro1.png', 'Gorro número 1', 399.00, 'Gorro con logo', 20, 'Accesorios'),
    ('/products/shirt2.png', 'Camisa número 2', 399.00, 'Camisa oversized', 25, 'Ropa'),
    ('/products/gorro2.png', 'Gorro número 2', 399.00, 'Gorro beanie', 15, 'Accesorios'),
    ('/products/pants1.png', 'Pantalón número 1', 399.00, 'Pantalón cargo', 40, 'Ropa'),
    ('/products/gorro3.png', 'Gorro número 3', 399.00, 'Gorro snapback', 35, 'Accesorios'),
    ('/products/shirt3.png', 'Camisa número 3', 399.00, 'Camisa gráfica', 28, 'Ropa'),
    ('/products/pants2.png', 'Pantalón número 2', 399.00, 'Pantalón jogger', 22, 'Ropa')
ON CONFLICT DO NOTHING;

-- Link all products to the default client catalog
INSERT INTO catalogs ("clientId", "productId", active)
SELECT 1, id, true FROM products
ON CONFLICT ("clientId", "productId") DO NOTHING;

-- Create a function to automatically update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updatedAt
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_catalogs_updated_at ON catalogs;
CREATE TRIGGER update_catalogs_updated_at BEFORE UPDATE ON catalogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Display summary
SELECT 'Database initialized successfully!' as message;
SELECT 'Users count: ' || COUNT(*) FROM users;
SELECT 'Clients count: ' || COUNT(*) FROM clients;
SELECT 'Products count: ' || COUNT(*) FROM products;
SELECT 'Catalogs count: ' || COUNT(*) FROM catalogs;
