# Database Documentation - Catalogos SaaS v1

## Overview

This document describes the PostgreSQL database schema for the Catalogos SaaS v1 application. The database is designed to manage users, clients (businesses), products, and their associated catalogs.

## Database Schema

### Tables

#### 1. **users**
Stores user authentication and profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| email | VARCHAR(255) | Unique email address for authentication |
| password | VARCHAR(255) | User password (plain text for demo - should be hashed in production) |
| role | VARCHAR(50) | User role: 'admin', 'client', or 'user' |
| nombre | VARCHAR(255) | User's full name |
| createdAt | TIMESTAMP | Record creation timestamp |
| updatedAt | TIMESTAMP | Record update timestamp |

**Indexes:** `idx_users_email` on email column

---

#### 2. **clients**
Stores business/client information for catalog customization.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| nombre | VARCHAR(255) | Business name |
| logo | VARCHAR(500) | Path to business logo image |
| color | VARCHAR(7) | Brand color (hex format, e.g., #f24427) |
| telefono | VARCHAR(20) | Contact phone number |
| direccion | TEXT | Business address |
| descripcion | TEXT | Business description |
| userId | INTEGER | Foreign key to users table |
| createdAt | TIMESTAMP | Record creation timestamp |
| updatedAt | TIMESTAMP | Record update timestamp |

**Relationships:**
- Many-to-One with `users` (userId → users.id)
- One-to-Many with `catalogs`

**Indexes:** `idx_clients_userId` on userId column

---

#### 3. **products**
Stores product catalog information.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| ruta | VARCHAR(500) | Path to product image |
| nombre | VARCHAR(255) | Product name |
| precio | DECIMAL(10,2) | Product price |
| description | TEXT | Product description |
| stock | INTEGER | Available stock quantity |
| category | VARCHAR(100) | Product category |
| createdAt | TIMESTAMP | Record creation timestamp |
| updatedAt | TIMESTAMP | Record update timestamp |

**Relationships:**
- One-to-Many with `catalogs`

**Indexes:** `idx_products_category` on category column

---

#### 4. **catalogs**
Junction table linking clients with products (many-to-many relationship).
Allows clients to have customized product catalogs with optional custom pricing.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| clientId | INTEGER | Foreign key to clients table |
| productId | INTEGER | Foreign key to products table |
| active | BOOLEAN | Whether product is active in this catalog |
| customPrice | DECIMAL(10,2) | Optional custom price for this client |
| createdAt | TIMESTAMP | Record creation timestamp |
| updatedAt | TIMESTAMP | Record update timestamp |

**Relationships:**
- Many-to-One with `clients` (clientId → clients.id)
- Many-to-One with `products` (productId → products.id)

**Constraints:**
- UNIQUE constraint on (clientId, productId) combination

**Indexes:** 
- `idx_catalogs_clientId` on clientId column
- `idx_catalogs_productId` on productId column

---

## Entity Relationship Diagram

```
┌─────────────┐
│    users    │
│─────────────│
│ id (PK)     │
│ email       │
│ password    │
│ role        │
│ nombre      │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────▼──────┐        ┌─────────────┐
│   clients   │   N    │  catalogs   │   N     ┌─────────────┐
│─────────────│────────│─────────────│─────────│  products   │
│ id (PK)     │        │ id (PK)     │         │─────────────│
│ nombre      │        │ clientId(FK)│         │ id (PK)     │
│ logo        │        │ productId(FK│         │ nombre      │
│ color       │        │ active      │         │ precio      │
│ telefono    │        │ customPrice │         │ ruta        │
│ userId (FK) │        └─────────────┘         │ description │
└─────────────┘                                │ stock       │
                                               │ category    │
                                               └─────────────┘
```

## Setup Instructions

### 1. Install PostgreSQL

#### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### On macOS (using Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

#### On Windows:
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE catalogos_saas;

# Create user (optional)
CREATE USER catalogos_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE catalogos_saas TO catalogos_user;

# Exit
\q
```

### 3. Initialize Database Schema

Run the initialization script:

```bash
# From the project root
psql -U postgres -d catalogos_saas -f database/init.sql

# Or if using a custom user:
psql -U catalogos_user -d catalogos_saas -f database/init.sql
```

### 4. Configure Backend

Create a `.env` file in the `backend/` directory based on `.env.example`:

```bash
cd backend
cp .env.example .env
```

Update the database configuration in `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=catalogos_saas
NODE_ENV=development
```

## Initial Test Data

The `init.sql` script creates the following test data:

### Users
- **Admin:** email: `admin@test.com`, password: `123`
- **User:** email: `user@test.com`, password: `123`
- **Client:** email: `client@test.com`, password: `123`

### Client/Business
- **UrbanStreet:** Default business with ID=1 (used for backward compatibility)

### Products
9 initial products in categories "Ropa" and "Accesorios"

### Catalogs
All products are linked to the default client (UrbanStreet)

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Clients (Businesses)
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `GET /api/clients/user/:userId` - Get all clients for a user
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Catalogs
- `GET /api/catalogs` - Get all catalog entries
- `GET /api/catalogs/:id` - Get catalog entry by ID
- `GET /api/catalogs/client/:clientId` - Get all products in a client's catalog
- `POST /api/catalogs` - Add product to client's catalog
- `PUT /api/catalogs/:id` - Update catalog entry
- `DELETE /api/catalogs/:id` - Remove product from catalog

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Business (Legacy - uses client ID=1)
- `GET /api/business` - Get default business information
- `PUT /api/business` - Update default business information

## Database Maintenance

### Backup Database
```bash
pg_dump -U postgres catalogos_saas > backup.sql
```

### Restore Database
```bash
psql -U postgres catalogos_saas < backup.sql
```

### Reset Database
```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE IF EXISTS catalogos_saas;"
psql -U postgres -c "CREATE DATABASE catalogos_saas;"
psql -U postgres -d catalogos_saas -f database/init.sql
```

## TypeORM Configuration

The backend uses TypeORM for database operations. The configuration is in `backend/src/database/database.config.ts`.

**Features:**
- Auto-synchronization in development mode (creates/updates tables automatically)
- Entity-based modeling
- Relationship management
- Query builder support

**Note:** In production, use migrations instead of auto-sync:
```bash
# Generate migration
npm run typeorm migration:generate -- -n MigrationName

# Run migrations
npm run typeorm migration:run
```

## Security Considerations

⚠️ **Important for Production:**

1. **Password Hashing:** Currently passwords are stored in plain text for demo purposes. Use bcrypt or similar for production:
   ```bash
   npm install bcrypt
   ```

2. **Environment Variables:** Never commit `.env` files to version control

3. **Database User:** Create a dedicated database user with limited privileges for production

4. **SQL Injection:** TypeORM provides protection, but always validate user input

5. **Connection Pooling:** Configure appropriate connection pool settings for production load

## Troubleshooting

### Connection Issues
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check connection settings in `.env`
- Ensure database exists: `psql -U postgres -l`

### Duplicate Key Error on Client Registration
If you encounter "duplicate key violates unique constraint clients_pkey" when creating new clients:

1. **Verify sequences are properly set:**
   ```bash
   psql -U postgres -d catalogos_saas -f database/verify_sequences.sql
   ```
   The next sequence value should always be greater than the current max ID.

2. **Reset the database:**
   ```bash
   psql -U postgres -c "DROP DATABASE IF EXISTS catalogos_saas;"
   psql -U postgres -c "CREATE DATABASE catalogos_saas;"
   psql -U postgres -d catalogos_saas -f database/init.sql
   ```

3. **Manual sequence fix (if needed):**
   ```sql
   -- Check current state
   SELECT MAX(id) FROM clients;
   SELECT last_value, is_called FROM clients_id_seq;
   
   -- Fix the sequence (replace X with MAX(id))
   SELECT setval('clients_id_seq', X, true);
   ```

**Note:** The `init.sql` script now properly sets sequences using `setval(seq, max_id, true)` which ensures the next auto-generated ID will be `max_id + 1`.

### TypeORM Sync Issues
- Set `synchronize: false` in production
- Use migrations for schema changes
- Check entity definitions match database schema

### Performance Issues
- Add indexes for frequently queried columns
- Use query optimization
- Monitor slow queries: Enable logging in TypeORM config

## Future Enhancements

Potential improvements for the database schema:

1. **Categories Table:** Extract categories into a separate table
2. **Orders Table:** Add order management functionality
3. **Images Table:** Support multiple images per product
4. **Reviews Table:** Add product reviews and ratings
5. **Inventory History:** Track stock changes over time
6. **User Sessions:** Proper session management
7. **Audit Logs:** Track all database changes
8. **Full-Text Search:** Add PostgreSQL full-text search capabilities

## Support

For issues or questions, please refer to the main project README or create an issue in the repository.
