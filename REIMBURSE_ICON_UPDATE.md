# Reimburse Icon Update

## Overview
Automatically display the 'reimburse' icon (`/icons/reimburse.png`) for all settlements with the title "상환" (reimbursement).

## Changes Made

### 1. Updated Constants (`src/constants/icons.ts`)

**Added:**
```typescript
export const REIMBURSE_ICON = '/icons/reimburse.png';
```

**New Helper Function:**
```typescript
/**
 * Get icon for settlement based on title
 * If title is "상환" (reimbursement), return reimburse icon
 */
export function getSettlementIcon(icon: string | null | undefined, title?: string): string {
  if (title === '상환') {
    return REIMBURSE_ICON;
  }
  if (!icon) return DEFAULT_ICON;
  return icon;
}
```

### 2. Updated Display Locations

#### A. Settlement List (`ExpensesTab.tsx:87`)
**Before:**
```tsx
<IconDisplay icon={s.icon || undefined} size="40px" />
```

**After:**
```tsx
<IconDisplay icon={getSettlementIcon(s.icon, s.title)} size="40px" />
```

#### B. Settlement Detail (`ExpenseDetailPage.tsx:94`)
**Before:**
```tsx
<IconDisplay icon={settlement.icon || undefined} size="64px" />
```

**After:**
```tsx
<IconDisplay icon={getSettlementIcon(settlement.icon, settlement.title)} size="64px" />
```

## How It Works

1. **Title Check**: The `getSettlementIcon()` helper checks if the settlement title is "상환"
2. **Icon Override**: If it's a reimbursement, returns `/icons/reimburse.png` regardless of stored icon
3. **Fallback Logic**: Otherwise, returns the stored icon or defaults to `/icons/money.png`

## Impact

- **Settlement List**: All reimbursements now show 💸 reimburse icon
- **Settlement Detail**: Reimbursement details show 💸 reimburse icon
- **Edit Protection**: ExpenseDetailPage already prevents editing reimbursements (line 79)
- **No Database Changes**: Works automatically without modifying stored data

## Example

**Before:**
- Reimbursement with stored icon: money.png or emoji → displays that icon
- Reimbursement with no icon: displays default money.png

**After:**
- Any settlement titled "상환" → always displays reimburse.png icon
- Visual consistency for all reimbursements

## Files Modified

1. `src/constants/icons.ts` - Added REIMBURSE_ICON constant and getSettlementIcon() helper
2. `src/pages/settlements/components/ExpensesTab.tsx` - Use getSettlementIcon() in list
3. `src/pages/ExpenseDetailPage.tsx` - Use getSettlementIcon() in detail view

## TypeScript Compilation

✅ No errors - all icon-related code compiles successfully
