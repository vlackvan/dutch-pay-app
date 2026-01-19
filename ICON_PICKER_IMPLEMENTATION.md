# IconPicker Implementation Summary

## Overview
Replaced the generic emoji-based icon selection system with a custom IconPicker component that uses PNG assets from `/public/icons`.

## Files Created

### 1. Icon Constants (`src/constants/icons.ts`)
- **ICON_OPTIONS**: Array of 26 icon options with name, path, and label
- **DEFAULT_ICON**: `/icons/money.png` (used as default across the app)
- **isEmoji()**: Helper to check if a value is an emoji (for backward compatibility)
- **getIconDisplay()**: Helper to get icon display value with fallback

### 2. IconPicker Component (`src/components/IconPicker/`)
- **IconPicker.tsx**: Main picker component with list layout (1 icon per row)
- **IconDisplay**: Helper component that handles both icon paths and emoji fallback
- **IconPicker.module.css**: Styling with selected state, hover effects, and smooth scrolling
- **index.ts**: Export file for easier imports

## Component Features

### IconPicker
- **Layout**: List view with 1 icon per row
- **Display**: Icon image on the left, label text on the right
- **Selected State**: Highlighted with blue background and border
- **Scrollable**: Max height of 400px with custom scrollbar
- **Responsive**: Hover effects and active states

### IconDisplay
- **Backward Compatible**: Displays emojis if the icon value doesn't start with '/'
- **Fallback**: Shows default money.png icon if no icon is provided
- **Flexible**: Accepts custom size and className props

## Integration Points

### 1. Main Screen - Group Creation (`SettlementsPage.tsx`)
- **Lines Changed**:
  - Imports: Added IconPicker and DEFAULT_ICON
  - State: Changed default from '🏖️' to DEFAULT_ICON
  - Display: Line 320 - Icon preview uses IconDisplay
  - Picker: Lines 330-331 - Replaced emoji buttons with IconPicker
  - List: Line 206 - Group list uses IconDisplay for backward compatibility

### 2. Settlement Create/Edit (`AddExpenseButton.tsx`)
- **Lines Changed**:
  - Imports: Added IconPicker and DEFAULT_ICON
  - State: Changed default from '🍀' to DEFAULT_ICON
  - Display: Line 238 - Icon button displays IconDisplay
  - Picker: Lines 241-247 - Emoji popover now shows IconPicker

### 3. Game Screen - 정산 정보 설정 (`GamesPage.tsx`)
- **Lines Changed**:
  - Imports: Added IconPicker and DEFAULT_ICON
  - State: Changed default from '💰' to DEFAULT_ICON
  - Picker: Line 545 - Replaced icon grid with IconPicker
  - Reset: Line 85 - Uses DEFAULT_ICON when resetting

### 4. Display Components (Backward Compatibility)
Updated to use IconDisplay for emoji fallback:
- **GroupHeader.tsx** (Line 8): Group detail header icon
- **ExpensesTab.tsx** (Line 86): Settlement list icons
- **ExpenseDetailPage.tsx** (Line 93): Settlement detail icon

## State Management Changes

### Before
```typescript
const [groupIcon, setGroupIcon] = useState('🏖️');      // Emoji string
const [emoji, setEmoji] = useState('🍀');               // Emoji string
const [settlementIcon, setSettlementIcon] = useState('💰'); // Emoji string
```

### After
```typescript
const [groupIcon, setGroupIcon] = useState(DEFAULT_ICON);      // '/icons/money.png'
const [emoji, setEmoji] = useState(DEFAULT_ICON);              // '/icons/money.png'
const [settlementIcon, setSettlementIcon] = useState(DEFAULT_ICON); // '/icons/money.png'
```

## Backward Compatibility

The `IconDisplay` component ensures backward compatibility:

1. **Emoji Detection**: If icon value doesn't start with '/', it's treated as an emoji
2. **Fallback**: If no icon is provided or undefined, shows default money.png
3. **Null Handling**: Converts null values to undefined for proper TypeScript typing

Example:
```typescript
// Old groups with emoji icons
<IconDisplay icon="🏖️" /> // Displays emoji as-is

// New groups with icon paths
<IconDisplay icon="/icons/sea.png" /> // Displays PNG image

// No icon provided
<IconDisplay icon={undefined} /> // Displays /icons/money.png
```

## Available Icons (26 total)
beers, bowling, bus, cake, drinks, food, friendship, fun, game, heart, home, money, mountain, movie, music, others, reimburse, relax, school, sea, shopping, shylove, taxi, travel, work, working_place

## TypeScript Fixes Applied
- Fixed `string | null` to `string | undefined` type mismatches
- Removed unused `ICONS` array and `pickIcon` function from SettlementsPage
- All icon-related type errors resolved

## Usage Example

```typescript
import IconPicker, { IconDisplay } from '@/components/IconPicker/IconPicker';
import { DEFAULT_ICON } from '@/constants/icons';

function MyComponent() {
  const [selectedIcon, setSelectedIcon] = useState(DEFAULT_ICON);

  return (
    <>
      {/* Display current icon */}
      <IconDisplay icon={selectedIcon} size="48px" />

      {/* Icon picker */}
      <IconPicker
        selectedIcon={selectedIcon}
        onSelectIcon={setSelectedIcon}
      />
    </>
  );
}
```

## Testing Checklist
- [x] Group creation with new icon picker
- [x] Settlement creation with new icon picker
- [x] Game screen settlement setup with new icon picker
- [x] Backward compatibility with existing emoji icons
- [x] Icon display in group list
- [x] Icon display in settlement list
- [x] Icon display in settlement detail
- [x] Fallback to default icon when undefined
- [x] TypeScript compilation without errors

## Notes
- All new groups/settlements will use PNG icons from `/public/icons`
- Existing data with emoji icons will continue to display correctly
- Default icon for all new entries is `/icons/money.png`
- Icons are 48px by default, adjustable via size prop
