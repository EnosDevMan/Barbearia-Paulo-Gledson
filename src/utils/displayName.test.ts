import { describe, expect, it } from 'vitest';
import { getCompactDisplayName } from './displayName';

describe('getCompactDisplayName', () => {
  it('shows only the first and second names', () => {
    expect(getCompactDisplayName('Enos Duarte Man')).toBe('Enos Duarte');
  });

  it('keeps a single name unchanged', () => {
    expect(getCompactDisplayName('Enos')).toBe('Enos');
  });

  it('normalizes surrounding and repeated whitespace', () => {
    expect(getCompactDisplayName('  Enos   Duarte Silva  ')).toBe('Enos Duarte');
  });
});
