# Backend Compatibility Fix - TypeORM Configuration

## Problem Statement

The NestJS backend was experiencing TypeORM configuration issues when trying to start with `npm run start:dev`. The main issues were:

1. **Foreign Key Mapping**: TypeORM relationships were not properly mapped to the existing database foreign key columns
2. **Schema Synchronization Conflicts**: TypeORM's `synchronize` option was set to `true`, causing it to try to modify the existing database schema created by `init.sql`
3. **Data Type Mismatches**: Some entity properties didn't match the database column types (e.g., `customPrice` in Catalog)
4. **Missing Unique Constraints**: The Catalog entity was missing the unique constraint on `(clientId, productId)`

## Changes Made

### 1. Client Entity (`backend/src/clients/client.entity.ts`)

**Added:**
- `@JoinColumn({ name: 'userId' })` decorator to properly map the foreign key
- Made `userId` nullable to match the database schema

**Why:** This tells TypeORM that the `userId` column is the foreign key for the `user` relation, preventing it from trying to create a separate column.

### 2. Catalog Entity (`backend/src/catalogs/catalog.entity.ts`)

**Added:**
- `@JoinColumn({ name: 'clientId' })` for the client relation
- `@JoinColumn({ name: 'productId' })` for the product relation
- `@Unique(['clientId', 'productId'])` decorator to match the database constraint
- Proper decimal type for `customPrice`: `@Column('decimal', { precision: 10, scale: 2, nullable: true })`

**Why:** 
- JoinColumn decorators prevent TypeORM from creating additional foreign key columns
- The Unique decorator ensures TypeORM knows about the database constraint
- Decimal type with precision matches the database schema exactly

### 3. Database Configuration (`backend/src/database/database.config.ts`)

**Changed:**
- Set `synchronize: false` (was: `process.env.NODE_ENV !== 'production'`)

**Why:** 
- The database schema is managed via the `database/init.sql` script
- Auto-synchronization would try to modify the existing tables, causing conflicts
- This approach is safer and more predictable for production deployments

## How to Use

### 1. Set up the Database

If you haven't already, initialize the database:

```bash
# Create the database (use your PostgreSQL user)
sudo -u postgres psql -c "CREATE DATABASE catalogos_saas;"

# Run the initialization script
# Replace 'postgres' with your database username if different
psql -U postgres -d catalogos_saas -f database/init.sql
```

**Note:** Use the same credentials in your `.env` file that you use to connect to PostgreSQL.

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Update the database credentials if needed:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_NAME=catalogos_saas
NODE_ENV=development
```

### 3. Install Dependencies and Start the Backend

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start in development mode
npm run start:dev
```

The backend should now start successfully without TypeORM query errors!

## Verification

You should see output like:

```
[Nest] INFO  [NestFactory] Starting Nest application...
[Nest] INFO  [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] INFO  [InstanceLoader] AppModule dependencies initialized
...
Backend running on: http://localhost:3000
```

## What Was Fixed

✅ Foreign key columns are now properly recognized by TypeORM
✅ No more schema synchronization conflicts
✅ Data types match the database schema exactly
✅ Unique constraints are properly declared
✅ The backend can connect to the existing database without errors

## Testing the API

You can test the endpoints:

```bash
# Get all products
curl http://localhost:3000/api/products

# Get business info
curl http://localhost:3000/api/business

# Get all catalogs
curl http://localhost:3000/api/catalogs
```

## Migration Strategy for Future Changes

Since `synchronize` is now disabled, for future schema changes:

1. Update the entity definitions in TypeScript
2. Update the `database/init.sql` script
3. If needed, create a migration SQL script
4. Apply the migration to the database manually

OR use TypeORM migrations (requires additional setup):

```bash
# First, add TypeORM CLI to package.json scripts if not present:
# "typeorm": "typeorm-ts-node-commonjs"

# Then generate and run migrations:
npx typeorm-ts-node-commonjs migration:generate ./src/migrations/MigrationName -d ./src/database/database.config.ts
npx typeorm-ts-node-commonjs migration:run -d ./src/database/database.config.ts
```

For most cases, manually updating `init.sql` and re-running it on a fresh database is simpler.

## Additional Notes

- All tests pass: `npm run test`
- Linting passes: `npm run lint`
- Build completes successfully: `npm run build`
- The fix maintains backward compatibility with existing API endpoints
