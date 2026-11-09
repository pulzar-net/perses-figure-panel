import type { FormatOptions } from '@perses-dev/components';
import type { PanelProps } from '@perses-dev/plugin-system';
import type { TimeSeriesData } from '@perses-dev/spec';

export interface PulzrFigurePanelOptions {
  format?: FormatOptions;
  /** The figure's color, any CSS color. The theme's text color unless set. */
  color?: string;
  /** What the period compared is called, after the change: `vs last week`. */
  comparedLabel?: string;
  /** Shown in place of the change when there is nothing to compare with: `Average for the selected week`. */
  caption?: string;
  /** A fall is good news: a fall is drawn in the success color and a rise in the error color. */
  lowerIsBetter?: boolean;
  /** A time in parts, as people say it: 6h 46m, not 6.8h. For a format in seconds, minutes or hours. */
  timeInParts?: boolean;
  /**
   * The figure, a rate, as a count of a total beside it: `1690/2639 Spaces Occupied`. `series` names the
   * series holding the total (the query asks for both); `label` follows.
   */
  of?: { series: string; label?: string };
  /**
   * A line under the title, from the query's series: `of {{booked_space_hours}} booked hours, occupied`. `{{name}}` is
   * the series' value, `{{name|%}}` the value as a percent (16.4%).
   */
  subtitle?: string;
  /** A small box under the figure, from the query's series as `subtitle` is: `{{new}} new · {{renewals}} renewals`. */
  detail?: string;
  /**
   * How the change reads. `signed` (the default): `↑ +0.7% vs last week`, flat within half a percent. `size`: `↑ 35.8%
   * vs last week`, whole past 100%, `0%` within a twentieth of one.
   */
  changeStyle?: 'signed' | 'size';
}

export type PulzrFigurePanelProps = PanelProps<PulzrFigurePanelOptions, TimeSeriesData>;
