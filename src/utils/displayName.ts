/** Keeps account names compact in navigation without changing the saved name. */
export const getCompactDisplayName = (name: string): string => {
  return name.trim().split(/\s+/).slice(0, 2).join(' ');
};
