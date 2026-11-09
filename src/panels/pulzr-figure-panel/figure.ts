import type { TimeSeries, TimeSeriesData } from '@perses-dev/spec';

/** A series' last value that is a number. */
export function lastValue(series: TimeSeries | undefined): number | undefined {
  const values = series?.values ?? [];
  for (let i = values.length - 1; i >= 0; i--) {
    const v = values[i]![1];
    if (v !== null && Number.isFinite(v)) return v;
  }
  return undefined;
}

/**
 * The figure and the one it is set against. A series labelled `compare` (the
 * period before, as the Pulzr and Parkeze datasources label it) is the one
 * set against; the first other series is the figure.
 */
export function figureOf(
  results: Array<{ data?: TimeSeriesData }>,
  of?: string,
): { now?: number; before?: number; total?: number } {
  const series = results.flatMap((r) => r.data?.series ?? []);
  const compared = (s: TimeSeries): boolean => Boolean(s.labels?.compare);
  const named = (s: TimeSeries): boolean => of !== undefined && (s.formattedName ?? s.name) === of;
  return {
    now: lastValue(series.find((s) => !compared(s) && !named(s))),
    before: lastValue(
      series.find((s) => compared(s) && !(of !== undefined && (s.formattedName ?? s.name).startsWith(of))),
    ),
    total: of === undefined ? undefined : lastValue(series.find((s) => !compared(s) && named(s))),
  };
}

const TO_MINUTES: Record<string, number> = { seconds: 1 / 60, minutes: 1, hours: 60 };

/** A time in parts, as people say it: 45m, 6h 46m, 7h, 2d 3h. Undefined for a unit that is not a time. */
export function timeInParts(value: number, unit: string | undefined): string | undefined {
  const per = unit ? TO_MINUTES[unit] : undefined;
  if (per === undefined) return undefined;
  const minutes = Math.round(value * per);
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 24 * 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  const d = Math.floor(minutes / (24 * 60));
  const h = Math.round((minutes % (24 * 60)) / 60);
  return h ? `${d}d ${h}h` : `${d}d`;
}

export type Direction = 'up' | 'down' | 'flat';

/** The change from before to now, in percent, and which way: flat within half a percent. */
export function changeOf(
  now: number | undefined,
  before: number | undefined,
): { percent: number; direction: Direction } | undefined {
  if (now === undefined || before === undefined || before <= 0) return undefined;
  const percent = ((now - before) / before) * 100;
  let direction: Direction = 'flat';
  if (percent > 0.5) direction = 'up';
  else if (percent < -0.5) direction = 'down';
  return { percent, direction };
}

const ARROW: Record<Direction, string> = { up: '↑', down: '↓', flat: '→' };

/** `↓ -47.3% vs last week`. */
export function changeText(
  change: { percent: number; direction: Direction },
  comparedLabel = 'vs the period before',
): string {
  const sign = change.percent > 0 ? '+' : '';
  return `${ARROW[change.direction]} ${sign}${change.percent.toFixed(1)}% ${comparedLabel}`;
}
