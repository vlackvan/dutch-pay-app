export interface IconOption {
  name: string;
  path: string;
  label: string;
}

export const ICON_OPTIONS: IconOption[] = [
  { name: 'beers', path: '/icons/beers.png', label: 'Beers' },
  { name: 'bowling', path: '/icons/bowling.png', label: 'Bowling' },
  { name: 'bus', path: '/icons/bus.png', label: 'Bus' },
  { name: 'cake', path: '/icons/cake.png', label: 'Cake' },
  { name: 'drinks', path: '/icons/drinks.png', label: 'Drinks' },
  { name: 'food', path: '/icons/food.png', label: 'Food' },
  { name: 'friendship', path: '/icons/friendship.png', label: 'Friendship' },
  { name: 'fun', path: '/icons/fun.png', label: 'Fun' },
  { name: 'game', path: '/icons/game.png', label: 'Game' },
  { name: 'heart', path: '/icons/heart.png', label: 'Heart' },
  { name: 'home', path: '/icons/home.png', label: 'Home' },
  { name: 'money', path: '/icons/money.png', label: 'Money' },
  { name: 'mountain', path: '/icons/mountain.png', label: 'Mountain' },
  { name: 'movie', path: '/icons/movie.png', label: 'Movie' },
  { name: 'music', path: '/icons/music.png', label: 'Music' },
  { name: 'others', path: '/icons/others.png', label: 'Others' },
  { name: 'reimburse', path: '/icons/reimburse.png', label: 'Reimburse' },
  { name: 'relax', path: '/icons/relax.png', label: 'Relax' },
  { name: 'school', path: '/icons/school.png', label: 'School' },
  { name: 'sea', path: '/icons/sea.png', label: 'Sea' },
  { name: 'shopping', path: '/icons/shopping.png', label: 'Shopping' },
  { name: 'shylove', path: '/icons/shylove.png', label: 'Shy Love' },
  { name: 'taxi', path: '/icons/taxi.png', label: 'Taxi' },
  { name: 'travel', path: '/icons/travel.png', label: 'Travel' },
  { name: 'work', path: '/icons/work.png', label: 'Work' },
  { name: 'working_place', path: '/icons/working_place.png', label: 'Working Place' },
];

export const DEFAULT_ICON = '/icons/money.png';
export const REIMBURSE_ICON = '/icons/reimburse.png';

/**
 * Check if a given icon value is an emoji (not a path)
 */
export function isEmoji(icon: string): boolean {
  return !icon.startsWith('/');
}

/**
 * Get icon display value with fallback
 * If the icon is a path, return it. If it's an emoji, return it as-is.
 */
export function getIconDisplay(icon: string | undefined): string {
  if (!icon) return DEFAULT_ICON;
  return icon;
}

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
