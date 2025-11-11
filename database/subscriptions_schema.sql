-- Catalogos SaaS v1 - Subscription Plans Schema
-- This script adds subscription management tables to the existing database

-- Table: subscription_plans
-- Stores available subscription plans and their limits
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    billing_period VARCHAR(20) DEFAULT 'monthly' NOT NULL, -- 'monthly', 'yearly'
    max_catalogs INTEGER DEFAULT 1, -- -1 for unlimited
    max_products_per_catalog INTEGER DEFAULT 20, -- -1 for unlimited
    features JSONB, -- Additional features as JSON
    is_active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: subscriptions
-- Stores user subscriptions to plans
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    "planId" INTEGER REFERENCES subscription_plans(id) ON DELETE RESTRICT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' NOT NULL, -- 'active', 'cancelled', 'expired', 'trialing'
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    auto_renew BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId") -- One active subscription per user
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_userId ON subscriptions("userId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_planId ON subscriptions("planId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, billing_period, max_catalogs, max_products_per_catalog, features, is_active) VALUES
    ('FREE', 'Plan gratuito para comenzar', 0.00, 'monthly', 1, 20, 
     '{"support": "community", "customization": "basic", "analytics": false}', true),
    
    ('BASIC', 'Plan básico para pequeños negocios', 299.00, 'monthly', 3, 100, 
     '{"support": "email", "customization": "advanced", "analytics": true, "priority_support": false}', true),
    
    ('PRO', 'Plan profesional para negocios en crecimiento', 799.00, 'monthly', 10, -1, 
     '{"support": "priority", "customization": "full", "analytics": true, "api_access": true, "priority_support": true}', true),
    
    ('ENTERPRISE', 'Plan empresarial con todo incluido', 1999.00, 'monthly', -1, -1, 
     '{"support": "dedicated", "customization": "full", "analytics": true, "api_access": true, "priority_support": true, "white_label": true}', true)
ON CONFLICT (name) DO NOTHING;

-- Assign FREE plan to all existing users without a subscription
INSERT INTO subscriptions ("userId", "planId", status, start_date)
SELECT u.id, (SELECT id FROM subscription_plans WHERE name = 'FREE'), 'active', CURRENT_TIMESTAMP
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM subscriptions s WHERE s."userId" = u.id
)
ON CONFLICT ("userId") DO NOTHING;

-- Add a comment to track schema version
COMMENT ON TABLE subscription_plans IS 'Subscription plans schema v1.0';
COMMENT ON TABLE subscriptions IS 'User subscriptions schema v1.0';
