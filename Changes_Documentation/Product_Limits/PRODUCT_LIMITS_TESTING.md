# Product Limits Implementation - Testing Guide

## Overview
This guide provides comprehensive testing instructions for the product limits per plan feature that was added to complement the existing catalog limits feature.

## What Was Implemented

### Backend Changes
1. **New Endpoint**: `GET /api/subscriptions/user/:userId/catalog/:catalogId/product-limits`
   - Returns current product count, max products allowed, and whether user can add more
   - Reuses existing `canAddProductToCatalog` method from subscriptions service

### Frontend Changes
1. **ProductLimitIndicator Component**: Visual indicator showing product usage per catalog
2. **Updated Subscription Store**: Added product limits tracking per catalog
3. **Enhanced AdminDashboard**: Shows both catalog and product limit indicators
4. **API Integration**: New `getProductLimits(userId, catalogId)` function

## Subscription Plans & Product Limits

| Plan | Catalogs | Products per Catalog | Validation |
|------|----------|---------------------|------------|
| FREE | 1 | 20 | ✅ Enforced |
| BASIC | 3 | 100 | ✅ Enforced |
| PRO | 10 | Unlimited (-1) | ✅ No product limit |
| ENTERPRISE | Unlimited (-1) | Unlimited (-1) | ✅ No limits |

## Manual Testing Scenarios

### Scenario 1: FREE Plan User - Product Limit
**Setup**: User with FREE plan (1 catalog, 20 products max)

**Steps**:
1. Login as a FREE plan user
2. Navigate to Admin Dashboard
3. Observe two indicators:
   - Catalog Limit Indicator: "Has utilizado 1 de 1 catálogos disponibles"
   - Product Limit Indicator: "Has utilizado X de 20 productos disponibles"
4. Add products until reaching 19 products
5. **Expected**: 
   - Progress bar turns yellow (near limit warning)
   - "Te estás acercando al límite de productos" message appears
   - "Mejorar Plan" button appears (yellow)
6. Try to add the 20th product
7. **Expected**: Product is added successfully
8. Try to add the 21st product
9. **Expected**:
   - Backend returns 403 Forbidden error
   - Modal appears with:
     - Title: "Límite de Productos Alcanzado"
     - Message: "Has alcanzado el límite de 20 productos..."
     - Upgrade suggestions specific to products
     - "Ver Planes" button

### Scenario 2: BASIC Plan User - Product Limit
**Setup**: User with BASIC plan (3 catalogs, 100 products max)

**Steps**:
1. Login as a BASIC plan user with 2 catalogs
2. Navigate to Admin Dashboard for first catalog
3. Add 80 products
4. **Expected**: 
   - Product indicator shows "80 de 100 productos disponibles"
   - Progress bar at 80% (blue, under warning threshold)
5. Add 20 more products to reach 100
6. **Expected**:
   - Progress bar turns red (at limit)
   - "Has alcanzado el límite de productos" message appears
   - "Mejorar Plan" button appears (red)
7. Try to add 101st product
8. **Expected**: 403 error with upgrade modal
9. Switch to second catalog
10. **Expected**: Product indicator resets, showing usage for that catalog only

### Scenario 3: PRO Plan User - Unlimited Products
**Setup**: User with PRO plan (10 catalogs, unlimited products)

**Steps**:
1. Login as a PRO plan user
2. Navigate to Admin Dashboard
3. **Expected**:
   - Catalog indicator shows "Has utilizado X de 10 catálogos disponibles"
   - Product indicator shows "✓ Productos ilimitados en este catálogo" (green background)
   - No progress bar for products
4. Add 500+ products
5. **Expected**: All products added successfully with no limit warnings

### Scenario 4: ENTERPRISE Plan User - No Limits
**Setup**: User with ENTERPRISE plan (unlimited everything)

**Steps**:
1. Login as an ENTERPRISE plan user
2. Navigate to Admin Dashboard
3. **Expected**:
   - Both indicators show unlimited status (green background)
   - No progress bars
   - No "Mejorar Plan" buttons
4. Create multiple catalogs and add many products to each
5. **Expected**: No restrictions whatsoever

### Scenario 5: Visual Indicator States

**Test all three visual states**:

1. **Under 80% Usage (Green/Blue)**:
   - Progress bar: Blue
   - No warning message
   - No upgrade button
   - Background: Green/Blue tint

2. **80-99% Usage (Yellow/Warning)**:
   - Progress bar: Yellow
   - Message: "Te estás acercando al límite de productos"
   - Upgrade button: Yellow background
   - Background: Yellow tint

3. **100% Usage (Red/At Limit)**:
   - Progress bar: Red at 100%
   - Message: "Has alcanzado el límite de productos"
   - Upgrade button: Red background
   - Background: Red tint

### Scenario 6: Error Handling

**Test proper error display**:

1. Reach product limit for any plan
2. Try to add a product via ProductForm
3. **Expected**:
   - Error caught by `isSubscriptionLimitError`
   - Parsed by `parseSubscriptionError` with type='product'
   - SubscriptionLimitModal opens with:
     - Red alert icon
     - Proper title and message
     - Product-specific upgrade benefits
     - "Ver Planes" button navigates to /subscription-plans
     - "Cancelar" button closes modal and form

## API Testing

### Test Product Limits Endpoint

```bash
# Get product limits for a catalog
curl http://localhost:3000/api/subscriptions/user/1/catalog/1/product-limits

# Expected Response:
{
  "canAdd": false,
  "currentProducts": 20,
  "maxProducts": 20,
  "reason": "Has alcanzado el límite de 20 productos por catálogo de tu plan FREE..."
}
```

### Test Adding Product Beyond Limit

```bash
# Try to add product to catalog at limit
curl -X POST http://localhost:3000/api/catalogs \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "productId": 50,
    "active": true
  }'

# Expected Response: 403 Forbidden
{
  "statusCode": 403,
  "message": "Has alcanzado el límite de 20 productos por catálogo de tu plan FREE. Actualiza tu plan para agregar más productos.",
  "error": "Forbidden"
}
```

## Component Integration Tests

### ProductLimitIndicator Component

**Props**:
- `userId`: Number (required) - User ID to fetch limits for
- `catalogId`: Number (required) - Catalog ID to check product usage

**Behavior**:
1. Fetches product limits on mount
2. Shows loading state (returns null while loading)
3. Shows error state (returns null on error)
4. Updates when userId or catalogId changes
5. Displays appropriate visual state based on usage percentage

### AdminDashboard Integration

**Verification**:
1. ProductLimitIndicator appears below SubscriptionLimitIndicator
2. Both indicators are in a `space-y-4` container for proper spacing
3. Indicators only show when not in read-only mode
4. Uses correct userId and catalogId from localStorage

## Store Integration Tests

### Subscription Store

**New Methods**:
```javascript
// Fetch product limits
fetchProductLimits(userId, catalogId)

// Check if user can add product
canAddProduct(catalogId)
```

**State**:
```javascript
{
  productLimits: {
    [catalogId]: {
      canAdd: boolean,
      currentProducts: number,
      maxProducts: number,
      reason?: string
    }
  }
}
```

## Cross-Browser Testing

Test in:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)

Verify:
- Visual indicators render correctly
- Progress bars animate smoothly
- Modal displays properly
- Navigation to /subscription-plans works
- Colors match design (green/yellow/red scheme)

## Responsive Testing

Test on different screen sizes:
- ✅ Desktop (1920x1080)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667)

Verify:
- Indicators stack properly
- Text remains readable
- Buttons remain accessible
- Modal displays correctly on small screens

## Edge Cases

1. **User without subscription**: Should fail gracefully
2. **Catalog without valid clientId**: ProductLimitIndicator shouldn't render
3. **Network error**: Should not crash, returns null
4. **Invalid userId/catalogId**: Should handle gracefully
5. **Concurrent product additions**: Backend validates atomically

## Regression Testing

Ensure existing functionality still works:
- ✅ Catalog limit indicator still works
- ✅ Adding products to catalog (under limit)
- ✅ Editing existing products
- ✅ Deleting products
- ✅ Switching between catalogs
- ✅ Plan upgrades refresh both indicators

## Performance Checks

1. **API Response Time**: Product limits endpoint should respond < 100ms
2. **Component Render**: ProductLimitIndicator should mount quickly
3. **Store Updates**: State updates should be efficient (< 50ms)
4. **No Memory Leaks**: Check with React DevTools Profiler

## Accessibility

- ✅ Icons have proper color contrast
- ✅ Text is readable (minimum 14px)
- ✅ Buttons have clear labels
- ✅ Modal can be dismissed with keyboard (Escape key)
- ✅ Screen readers can access all content

## Testing Checklist

### Backend
- [x] Builds successfully without errors
- [x] New endpoint returns correct data
- [x] All existing tests pass
- [x] Proper error responses (403) when limit exceeded

### Frontend
- [x] Builds successfully without errors
- [x] No linting errors
- [x] ProductLimitIndicator component created
- [x] Subscription store updated
- [x] AdminDashboard integration complete
- [x] Error handling works correctly

### Integration
- [ ] Manual testing with FREE plan
- [ ] Manual testing with BASIC plan
- [ ] Manual testing with PRO plan
- [ ] Manual testing with ENTERPRISE plan
- [ ] Visual states verify correctly
- [ ] Modal displays properly
- [ ] Navigation to plans page works

## Known Limitations

1. Product limits are per-catalog, not global per user
2. Indicators require valid userId and catalogId from localStorage
3. Real-time updates require page refresh or manual refetch
4. No WebSocket support for instant limit updates across sessions

## Future Enhancements

1. **Real-time Updates**: Use WebSockets to update limits instantly
2. **Batch Operations**: Warn before bulk adding products that would exceed limits
3. **Historical Tracking**: Show limit usage over time
4. **Notifications**: Email when approaching limits
5. **Custom Limits**: Admin override for specific users
6. **Usage Analytics**: Dashboard showing limit utilization trends

## Success Criteria

Implementation is successful when:
- ✅ Backend builds and all tests pass
- ✅ Frontend builds with no errors
- ✅ Product indicator displays correctly for all plan types
- ✅ Error handling works when limits exceeded
- ✅ Visual states match design specifications
- ✅ Modal provides clear upgrade path
- ✅ Integration with existing features is seamless
- ✅ No regression in existing functionality
