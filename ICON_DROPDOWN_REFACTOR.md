# IconDropdown Refactor Summary

## Overview
Replaced the large, scrollable IconPicker component with a compact "Button + Dropdown" IconDropdown component, matching the style of the existing payment method dropdown.

## Changes Made

### 1. New Component Created: `IconDropdown`
**Location:** `src/components/IconDropdown/`

**Features:**
- Compact button showing selected icon (24px-32px)
- Floating dropdown menu (not persistent scrollpane)
- Clean design with [Icon] + [Text Label] layout
- No bulky wrapper boxes around icons
- Matches payment dropdown styling (colors, borders, shadows)
- Click-outside-to-close functionality
- Rotating chevron indicator
- Two size options: 'small' (40px height) and 'medium' (44px height)

**Files:**
- `IconDropdown.tsx` - Main component with dropdown logic
- `IconDropdown.module.css` - Styling matching PaymentCard dropdown
- `index.ts` - Export file

### 2. Styling Details
Based on `PaymentCard.module.css`:
- **Button:** Rounded (14px), warm beige background (#fff7eb), subtle border
- **Dropdown Menu:** Floating with shadow, warm background (#fffaf0), max-height 400px
- **Menu Items:** 48px height, [28px icon] + [label text], hover/active states
- **Active State:** Darker background, bold font weight
- **Icons:** 28px in dropdown menu, 24-32px in button (size-dependent)

### 3. Integration Points (Replaced IconPicker)

#### A. Group Creation Form (`SettlementsPage.tsx:301`)
**Before:**
```tsx
<IconPicker selectedIcon={groupIcon} onSelectIcon={setGroupIcon} />
```

**After:**
```tsx
<IconDropdown selectedIcon={groupIcon} onSelectIcon={setGroupIcon} size="medium" />
```

**Location:** Sheet modal → "그룹 추가" form → "아이콘" section

---

#### B. Settlement Create/Edit Form (`AddExpenseButton.tsx:231-233`)
**Before:**
```tsx
<div className={styles.iconBtnWrap}>
  <button onClick={() => setEmojiOpen((v) => !v)}>
    <IconDisplay icon={emoji} size="24px" />
  </button>
  {emojiOpen && (
    <div className={styles.emojiPopover}>
      <IconPicker selectedIcon={emoji} onSelectIcon={setEmoji} />
    </div>
  )}
</div>
```

**After:**
```tsx
<div className={styles.iconBtnWrap}>
  <IconDropdown selectedIcon={emoji} onSelectIcon={setEmoji} size="small" />
</div>
```

**Changes:**
- Removed `emojiOpen` state variable
- Removed manual button + popover implementation
- IconDropdown handles open/close internally

**Location:** Settlement form → Title row → Icon button (between title input and camera button)

---

#### C. Game Screen - 정산 정보 설정 (`GamesPage.tsx:545`)
**Before:**
```tsx
<IconPicker selectedIcon={settlementIcon} onSelectIcon={setSettlementIcon} />
```

**After:**
```tsx
<IconDropdown selectedIcon={settlementIcon} onSelectIcon={setSettlementIcon} size="medium" />
```

**Location:** Game setup step → "아이콘" section

---

### 4. State Cleanup

**AddExpenseButton.tsx:**
- **Removed:** `const [emojiOpen, setEmojiOpen] = useState(false);`
- **Kept:** `const [emoji, setEmoji] = useState(DEFAULT_ICON);`

Other files already had simple state management, no cleanup needed.

---

### 5. Icon Display Remains Unchanged

The `IconDisplay` component from `IconPicker.tsx` is **still used** for displaying icons in:
- Group list (SettlementsPage.tsx:206)
- Group header (GroupHeader.tsx:8)
- Settlement list (ExpensesTab.tsx:86)
- Settlement detail (ExpenseDetailPage.tsx:93)

This provides backward compatibility for existing emoji icons in the database.

---

## Component Comparison

| Feature | Old IconPicker | New IconDropdown |
|---------|---------------|------------------|
| Layout | Persistent scrollpane | Toggleable dropdown |
| Height | Always visible, ~400px | Button only, dropdown on demand |
| Icon Size | 40px | 28px in menu, 24-32px in button |
| Wrapper | Box backgrounds | Clean, no boxes |
| Styling | Generic blue theme | Warm beige matching app theme |
| Space Usage | Always occupies vertical space | Minimal when closed |
| User Flow | Scroll through list | Click button → select → auto-close |

---

## Technical Details

### Dropdown Behavior
- **Open:** Click button to toggle dropdown
- **Close:**
  - Click outside (handled by `useRef` + `useEffect`)
  - Select an icon (auto-closes)
  - Click button again (toggle)

### Accessibility
- `aria-expanded` attribute on button
- `aria-label="아이콘 선택"` on button
- `role="listbox"` on dropdown menu
- `aria-label="아이콘 선택"` on menu

### Responsive Design
- Dropdown positioned absolutely below button
- Min-width: 200px
- Max-height: 400px with scroll
- Custom scrollbar styling
- Z-index: 40 for proper layering

---

## Icons Available (26 total)
beers, bowling, bus, cake, drinks, food, friendship, fun, game, heart, home, money, mountain, movie, music, others, reimburse, relax, school, sea, shopping, shylove, taxi, travel, work, working_place

---

## Testing Checklist
- [x] Group creation with icon dropdown
- [x] Settlement creation with compact icon dropdown
- [x] Settlement edit with icon dropdown
- [x] Game screen settlement setup with icon dropdown
- [x] Click outside to close dropdown
- [x] Auto-close on selection
- [x] Icon display in existing lists (backward compatibility)
- [x] Small vs medium size rendering
- [x] TypeScript compilation

---

## Benefits of Refactor

### Space Efficiency
- **Before:** IconPicker always occupied ~400px vertical space
- **After:** IconDropdown button is 40-44px, dropdown appears only when needed

### Visual Consistency
- Matches existing payment dropdown design
- Consistent with app's warm color palette
- Professional, polished appearance

### User Experience
- Faster selection (no scrolling through persistent list)
- Less visual clutter in forms
- Clearer visual hierarchy
- Familiar dropdown interaction pattern

### Code Quality
- Reuses established dropdown pattern
- Simpler state management in AddExpenseButton
- Consistent component API across all three locations
- Easier to maintain

---

## Migration Notes

### Backward Compatibility
- Old emoji icons (e.g., "🏖️") still display correctly via `IconDisplay`
- New selections use icon paths (e.g., "/icons/sea.png")
- No database migration required

### Default Icon
- All new groups/settlements default to `/icons/money.png`
- Previously used various emoji defaults (🏖️, 🍀, 💰)

### Removed Files
- ❌ None - `IconPicker.tsx` kept for `IconDisplay` export

### New Dependencies
- ✅ `IconDropdown` component and styles
- ✅ Uses existing `ICON_OPTIONS` from `constants/icons.ts`
