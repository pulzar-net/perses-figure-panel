import type { TimeSeriesData } from '@perses-dev/spec';

import { changeOf, changeText, figureOf, fill, lastValue, sizeChange, timeInParts, valuesOf } from './figure';

const data = (...series: TimeSeriesData['series']): { data: TimeSeriesData } => ({ data: { series } });

describe('figureOf', () => {
  it('takes the figure from the unlabelled series and the period before from the one labelled compare', () => {
    const results = [
      data(
        { name: 'Occupancy · previous period', labels: { compare: 'previous' }, values: [[1, 0.2]] },
        { name: 'Occupancy', values: [[1, 0.3]] },
      ),
    ];
    expect(figureOf(results)).toEqual({ now: 0.3, before: 0.2 });
  });

  it('reads across queries, and has no period before when none is labelled', () => {
    expect(figureOf([data({ name: 'a', values: [[1, 5]] }), data({ name: 'b', values: [[1, 9]] })])).toEqual({
      now: 5,
      before: undefined,
    });
  });

  it('has nothing without data', () => {
    expect(figureOf([])).toEqual({ now: undefined, before: undefined });
    expect(figureOf([{ data: undefined }])).toEqual({ now: undefined, before: undefined });
  });
});

describe('lastValue', () => {
  it('is the last number, skipping gaps at the end', () => {
    expect(
      lastValue({
        name: 'x',
        values: [
          [1, 2],
          [2, 3],
          [3, null],
        ],
      }),
    ).toBe(3);
    expect(lastValue({ name: 'x', values: [[1, null]] })).toBeUndefined();
  });
});

describe('changeOf', () => {
  it('is the change in percent, and which way', () => {
    expect(changeOf(0.15, 0.3)).toEqual({ percent: -50, direction: 'down' });
    expect(changeOf(3302, 3000)?.direction).toBe('up');
    expect(changeOf(100, 100.4)?.direction).toBe('flat');
  });

  it('is nothing without a period before, or from zero', () => {
    expect(changeOf(1, undefined)).toBeUndefined();
    expect(changeOf(1, 0)).toBeUndefined();
    expect(changeOf(undefined, 1)).toBeUndefined();
  });
});

describe('changeText', () => {
  it('reads as the console has it', () => {
    expect(changeText({ percent: -47.31, direction: 'down' }, 'vs last week')).toBe('↓ -47.3% vs last week');
    expect(changeText({ percent: 10, direction: 'up' }, 'vs yesterday')).toBe('↑ +10.0% vs yesterday');
    expect(changeText({ percent: 0.2, direction: 'flat' })).toBe('→ +0.2% vs the period before');
  });
});

describe('figureOf with a total', () => {
  it('takes the total from the series named, and the figure and period before from the others', () => {
    const results = [
      data(
        { name: 'Peak occupancy', values: [[1, 0.64]] },
        { name: 'Spaces', values: [[1, 2639]] },
        { name: 'Peak occupancy · previous period', labels: { compare: 'previous' }, values: [[1, 0.21]] },
        { name: 'Spaces · previous period', labels: { compare: 'previous' }, values: [[1, 2639]] },
      ),
    ];
    expect(figureOf(results, 'Spaces')).toEqual({ now: 0.64, before: 0.21, total: 2639 });
  });
});

describe('timeInParts', () => {
  it('says a time as people do', () => {
    expect(timeInParts(45, 'minutes')).toBe('45m');
    expect(timeInParts(406, 'minutes')).toBe('6h 46m');
    expect(timeInParts(420, 'minutes')).toBe('7h');
    expect(timeInParts(3, 'hours')).toBe('3h');
    expect(timeInParts(3000, 'minutes')).toBe('2d 2h');
    expect(timeInParts(26 * 60 + 5, 'minutes')).toBe('26h 5m');
    expect(timeInParts(90, 'seconds')).toBe('2m');
  });

  it('is nothing for a unit that is not a time', () => {
    expect(timeInParts(5, 'percent')).toBeUndefined();
    expect(timeInParts(5, undefined)).toBeUndefined();
  });
});

describe('fill', () => {
  const values = valuesOf([
    data(
      { name: 'bookings', values: [[1, 77]] },
      { name: 'no_show_pct', values: [[1, 16.438]] },
      { name: 'booked_space_hours', values: [[1, 1309.27]] },
      { name: 'bookings · previous period', labels: { compare: 'previous' }, values: [[1, 70]] },
    ),
  ]);

  it('fills names with values and percents', () => {
    expect(fill('{{no_show_pct|%}} of {{bookings}} bookings', values)).toBe('16.4% of 77 bookings');
    expect(fill('of {{ booked_space_hours }} booked hours, occupied', values)).toBe(
      'of 1,309.3 booked hours, occupied',
    );
  });

  it('leaves out the period compared, and says — for a name with no value', () => {
    expect(fill('{{late}} late', values)).toBe('— late');
    expect(values.has('bookings · previous period')).toBe(false);
  });
});

describe('sizeChange', () => {
  it('reads as the reports have it', () => {
    expect(sizeChange(13566, 9990)).toEqual({ text: '↑ 35.8%', tone: 'good' });
    expect(sizeChange(119, 3)).toEqual({ text: '↑ 3867%', tone: 'good' });
    expect(sizeChange(224, 97, true)).toEqual({ text: '↑ 131%', tone: 'bad' });
    expect(sizeChange(5, 5.001)).toEqual({ text: '0%', tone: 'flat' });
  });

  it('is nothing without a period before, or from zero; a fall from below zero is still a fall', () => {
    expect(sizeChange(1, undefined)).toBeUndefined();
    expect(sizeChange(1, 0)).toBeUndefined();
    expect(sizeChange(-2, -1)?.text).toBe('↓ 100%');
  });
});
