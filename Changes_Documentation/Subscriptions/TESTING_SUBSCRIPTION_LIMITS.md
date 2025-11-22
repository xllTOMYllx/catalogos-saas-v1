# Testing Subscription Limits Validation

This document describes how to test the subscription limits validation feature.

## Prerequisites

1. Database must have the subscriptions schema installed:
   ```bash
   psql -U postgres -d catalogos_saas -f database/subscriptions_schema.sql
   ```

2. Backend and frontend must be running:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run start:dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

## Test Scenarios

### Scenario 1: View Subscription Limits (FREE Plan)

**Expected Behavior:** Users on the FREE plan should see they have used 0 of 1 catalogs available.

**Steps:**
1. Register a new user or log in with an existing user on the FREE plan
2. Navigate to the admin dashboard
3. Look for the "Límite de Catálogos" indicator at the top
4. Verify it shows:
   - "Has utilizado X de 1 catálogos disponibles"
   - Progress bar showing usage
   - No warning if under limit

### Scenario 2: Attempt to Exceed Catalog Limit (FREE Plan)

**Expected Behavior:** User on FREE plan with 1 catalog should be blocked from creating a second catalog.

**Steps:**
1. Log in with a user on the FREE plan who already has 1 catalog
2. Try to create a new catalog/client from the admin panel
3. Expected result:
   - Backend returns a 403 Forbidden error
   - Error message: "Has alcanzado el límite de 1 catálogos de tu plan actual (tienes 1). Actualiza tu plan para crear más catálogos."
   - Frontend shows an error toast/notification with the message

### Scenario 3: Attempt to Exceed Product Limit (FREE Plan)

**Expected Behavior:** User on FREE plan trying to add more than 20 products to a catalog should be blocked.

**Steps:**
1. Log in with a user on the FREE plan
2. Navigate to the admin dashboard of their catalog
3. Add products until reaching 20 products
4. Try to add the 21st product
5. Expected result:
   - Backend returns a 403 Forbidden error
   - Error message contains: "Has alcanzado el límite de 20 productos por catálogo"
   - Frontend shows the SubscriptionLimitModal with:
     - Title: "Límite de Productos Alcanzado"
     - The error message
     - A button to "Ver Planes" that navigates to /subscription-plans

### Scenario 4: Visual Warnings Near Limit

**Expected Behavior:** When approaching the limit (80%+), show visual warnings.

**Steps:**
1. Log in with a user on the FREE plan
2. Ensure they have created their 1 catalog (100% of limit)
3. Navigate to the admin dashboard
4. The SubscriptionLimitIndicator should show:
   - Red background (isAtLimit = true)
   - Red progress bar at 100%
   - Message: "Has alcanzado el límite de tu plan actual."
   - "Mejorar Plan" button in red

### Scenario 5: Upgrade Prompt

**Expected Behavior:** When limit is reached, user should be able to easily navigate to upgrade options.

**Steps:**
1. Trigger any limit error (catalog or product)
2. Verify the SubscriptionLimitModal appears with:
   - Clear error message
   - List of benefits of upgrading
   - "Ver Planes" button
3. Click "Ver Planes"
4. Verify navigation to /subscription-plans page
5. User can see plan options and pricing

### Scenario 6: BASIC Plan Limits

**Expected Behavior:** Users on BASIC plan can create up to 3 catalogs with 100 products each.

**Steps:**
1. Upgrade a user to BASIC plan (via database or API)
   ```sql
   UPDATE subscriptions SET "planId" = (SELECT id FROM subscription_plans WHERE name = 'BASIC') WHERE "userId" = YOUR_USER_ID;
   ```
2. Verify the limit indicator shows "3" as max catalogs
3. Create 3 catalogs successfully
4. Try to create a 4th catalog - should be blocked
5. In any catalog, add 100 products successfully
6. Try to add the 101st product - should be blocked

### Scenario 7: PRO Plan - Unlimited Products

**Expected Behavior:** Users on PRO plan have unlimited products (but limited catalogs).

**Steps:**
1. Upgrade a user to PRO plan
   ```sql
   UPDATE subscriptions SET "planId" = (SELECT id FROM subscription_plans WHERE name = 'PRO') WHERE "userId" = YOUR_USER_ID;
   ```
2. Verify the limit indicator shows "10" as max catalogs
3. Create catalogs (up to 10)
4. Add more than 100 products to a catalog - should succeed
5. The product limit check should return unlimited (-1)

### Scenario 8: ENTERPRISE Plan - All Unlimited

**Expected Behavior:** Users on ENTERPRISE plan have unlimited catalogs and products.

**Steps:**
1. Upgrade a user to ENTERPRISE plan
   ```sql
   UPDATE subscriptions SET "planId" = (SELECT id FROM subscription_plans WHERE name = 'ENTERPRISE') WHERE "userId" = YOUR_USER_ID;
   ```
2. Verify the limit indicator shows "✓ Catálogos ilimitados"
3. Create multiple catalogs - should succeed without limit
4. Add products without limit - should succeed

## API Testing

### Test Catalog Limit Check

```bash
# Get user limits
curl http://localhost:3000/api/subscriptions/user/1/limits

# Expected response:
{
  "canCreateCatalog": false,
  "canAddProduct": true,
  "currentCatalogs": 1,
  "maxCatalogs": 1,
  "maxProducts": 20
}
```

### Test Create Catalog Beyond Limit

```bash
# Try to create catalog when at limit
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test Catalog",
    "userId": 1
  }'

# Expected response (403 Forbidden):
{
  "statusCode": 403,
  "message": "Has alcanzado el límite de 1 catálogos de tu plan actual (tienes 1). Actualiza tu plan para crear más catálogos."
}
```

### Test Add Product Beyond Limit

```bash
# Try to add product when at limit
curl -X POST http://localhost:3000/api/catalogs \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "productId": 1,
    "active": true
  }'

# Expected response (403 Forbidden):
{
  "statusCode": 403,
  "message": "Has alcanzado el límite de 20 productos por catálogo de tu plan FREE. Actualiza tu plan para agregar más productos."
}
```

## UI Components to Verify

### SubscriptionLimitIndicator
- Location: Top of AdminDashboard
- Shows current usage vs limit
- Color coding:
  - Blue: Under 80% usage
  - Yellow: 80-99% usage  
  - Red: At limit
- "Mejorar Plan" button when at/near limit

### SubscriptionLimitModal
- Appears when limit exceeded
- Shows error title and message
- Lists benefits of upgrading
- "Ver Planes" button navigates to subscription plans page
- "Cancelar" button closes modal

## Expected Error Messages

### Catalog Limit
```
Has alcanzado el límite de {N} catálogos de tu plan actual (tienes {current}). 
Actualiza tu plan para crear más catálogos.
```

### Product Limit
```
Has alcanzado el límite de {N} productos por catálogo de tu plan {PLAN_NAME}. 
Actualiza tu plan para agregar más productos.
```

## Notes

- All limits are enforced in the backend for security
- Frontend shows real-time usage from the API
- Error messages are user-friendly and suggest upgrading
- Modal provides clear path to upgrade via subscription plans page
