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

const nameOf = (s: TimeSeries): string => s.formattedName ?? s.name;
const compared = (s: TimeSeries): boolean => Boolean(s.labels?.compare);

/** The series compared with the one named: `<name> · previous period`, `<name> · last year`. */
export function twinOf(series: TimeSeries[], name: string): TimeSeries | undefined {
  return series.find((s) => compared(s) && nameOf(s).startsWith(`${name} · `));
}

/**
 * The figure and the one it is set against. A series labelled `compare` (the period before, as the Pulzr and
 * Parkeze datasources label it) is the one set against; the first other series is the figure, leaving out `of` and
 * the series named in `others` (a sparkline's, the rows'). The period before is the figure's twin by name, or else
 * the first compared series that is not theirs.
 */
export function figureOf(
  results: Array<{ data?: TimeSeriesData }>,
  of?: string,
  others: string[] = [],
): { now?: number; before?: number; total?: number } {
  const series = results.flatMap((r) => r.data?.series ?? []);
  const taken = of === undefined ? others : [of, ...others];
  const figure = series.find((s) => !compared(s) && !taken.includes(nameOf(s)));
  return {
    now: lastValue(figure),
    before: lastValue(
      (figure && twinOf(series, nameOf(figure))) ??
        series.find((s) => compared(s) && !taken.some((name) => nameOf(s).startsWith(name))),
    ),
    total: of === undefined ? undefined : lastValue(series.find((s) => !compared(s) && nameOf(s) === of)),
  };
}

/** The last value of the series named and of its twin, the period before. */
export function pairOf(results: Array<{ data?: TimeSeriesData }>, name: string): { now?: number; before?: number } {
  const series = results.flatMap((r) => r.data?.series ?? []);
  return {
    now: lastValue(series.find((s) => !compared(s) && nameOf(s) === name)),
    before: lastValue(twinOf(series, name)),
  };
}

/** Every number over time of the series named, for a sparkline. */
export function valuesOver(results: Array<{ data?: TimeSeriesData }>, name: string): number[] {
  const series = results.flatMap((r) => r.data?.series ?? []).find((s) => !compared(s) && nameOf(s) === name);
  return (series?.values ?? []).flatMap(([, v]) => (v !== null && Number.isFinite(v) ? [v] : []));
}

const TO_MINUTES: Record<string, number> = { seconds: 1 / 60, minutes: 1, hours: 60 };

/**
 * A time in parts, as people say it: 45m, 6h 46m, 7h, and past two days 2d 3h, the minutes being noise there.
 * Undefined for a unit that is not a time.
 */
export function timeInParts(value: number, unit: string | undefined): string | undefined {
  const per = unit ? TO_MINUTES[unit] : undefined;
  if (per === undefined) return undefined;
  const minutes = Math.round(value * per);
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 48 * 60) {
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

/** The last value of each series not labelled `compare`, by its formatted name. */
export function valuesOf(results: Array<{ data?: TimeSeriesData }>): Map<string, number> {
  const values = new Map<string, number>();
  for (const s of results.flatMap((r) => r.data?.series ?? [])) {
    if (s.labels?.compare) continue;
    const v = lastValue(s);
    if (v !== undefined) values.set(s.formattedName ?? s.name, v);
  }
  return values;
}

/** A template's `{{name}}` and `{{name|%}}` filled from the series' values; `—` for one with none. */
export function fill(template: string, values: Map<string, number>): string {
  return template.replace(/\{\{\s*([^}|]+?)\s*(\|\s*%\s*)?\}\}/g, (_, name: string, percent?: string) => {
    const v = values.get(name);
    if (v === undefined) return '—';
    return percent ? `${v.toFixed(1)}%` : v.toLocaleString(undefined, { maximumFractionDigits: 1 });
  });
}

export type Tone = 'good' | 'bad' | 'flat';

/** A pillar's arrows, for the change as a badge: `↗ 133%`. */
export const BADGE_ARROWS: [string, string] = ['↗', '↘'];

/**
 * The change as its size, good or bad news: `↑ 35.8%`, whole past 100%, `0%` within a twentieth of one. `arrows`
 * are the rise's and the fall's.
 */
export function sizeChange(
  now: number | undefined,
  before: number | undefined,
  lowerIsBetter = false,
  arrows: [string, string] = ['↑', '↓'],
): { text: string; tone: Tone } | undefined {
  if (now === undefined || before === undefined || before === 0) return undefined;
  const percent = ((now - before) / Math.abs(before)) * 100;
  if (Math.abs(percent) < 0.05) return { text: '0%', tone: 'flat' };
  const size = Math.abs(percent) >= 100 ? String(Math.round(Math.abs(percent))) : Math.abs(percent).toFixed(1);
  const good = lowerIsBetter ? percent < 0 : percent > 0;
  return { text: `${percent > 0 ? arrows[0] : arrows[1]} ${size}%`, tone: good ? 'good' : 'bad' };
}
