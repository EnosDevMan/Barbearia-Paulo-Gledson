import { describe, expect, it } from 'vitest';
import { generateSlotStartMinutes } from './scheduling';

describe('generateSlotStartMinutes', () => {
  it.each([
    { interval: 0, expected: [540, 570, 600, 630] },
    { interval: 5, expected: [540, 575, 610] },
    { interval: 10, expected: [540, 580, 620] },
    { interval: 15, expected: [540, 585] },
    { interval: 20, expected: [540, 590] },
    { interval: 30, expected: [540, 600] },
  ])('avança duração + $interval minutos', ({ interval, expected }) => {
    expect(generateSlotStartMinutes(540, 660, 30, interval)).toEqual(expected);
  });

  it('não oferece um horário cujo serviço e intervalo ultrapassem o fechamento', () => {
    expect(generateSlotStartMinutes(540, 639, 30, 10)).toEqual([540, 580]);
  });

  it('suporta serviços de durações diferentes', () => {
    expect(generateSlotStartMinutes(540, 660, 20, 10)).toEqual([540, 570, 600, 630]);
    expect(generateSlotStartMinutes(540, 660, 45, 15)).toEqual([540, 600]);
  });

  it('rejeita configurações que não podem produzir horários válidos', () => {
    expect(generateSlotStartMinutes(540, 660, 0, 10)).toEqual([]);
    expect(generateSlotStartMinutes(540, 660, 30, -1)).toEqual([]);
    expect(generateSlotStartMinutes(660, 540, 30, 10)).toEqual([]);
  });
});
