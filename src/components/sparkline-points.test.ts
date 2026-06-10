import { sparklinePoints } from './sparkline-points';

describe('sparklinePoints', () => {
  it('maps min to bottom and max to top of the padded view box', () => {
    // width 100, height 22, padding 1 → inner height 20
    expect(sparklinePoints([10, 20, 15], 100, 22)).toBe('0,21 50,1 100,11');
  });

  it('draws a horizontal midline for a flat series', () => {
    expect(sparklinePoints([5, 5, 5], 100, 22)).toBe('0,11 50,11 100,11');
  });

  it('returns an empty string when there is nothing to draw', () => {
    expect(sparklinePoints([], 100, 22)).toBe('');
    expect(sparklinePoints([42], 100, 22)).toBe('');
  });

  it('compresses series below the range floor around the midline', () => {
    // center 100, floor 0.1 × 100 = 10, range 2 → amplitude 2/10 of full height
    expect(sparklinePoints([99, 101], 100, 22, 1, 0.1)).toBe('0,13 100,9');
  });

  it('leaves series above the range floor untouched', () => {
    expect(sparklinePoints([10, 20, 15], 100, 22, 1, 0.01)).toBe(
      sparklinePoints([10, 20, 15], 100, 22),
    );
  });

  it('rounds coordinates to two decimals', () => {
    const points = sparklinePoints([1, 2, 3], 100, 22);
    for (const pair of points.split(' ')) {
      const [x, y] = pair.split(',');
      expect(x).toMatch(/^\d+(\.\d{1,2})?$/);
      expect(y).toMatch(/^\d+(\.\d{1,2})?$/);
    }
  });
});
