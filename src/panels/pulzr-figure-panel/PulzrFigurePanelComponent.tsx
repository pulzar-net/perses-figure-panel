import { Box, Typography, useTheme } from '@mui/material';
import type { FormatOptions } from '@perses-dev/components';
import { EChart, formatValue, useChartsTheme } from '@perses-dev/components';
import { LineChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import { color as colors, use as registerECharts } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import {
  BADGE_ARROWS,
  changeOf,
  changeText,
  figureOf,
  fill,
  pairOf,
  sizeChange,
  timeInParts,
  valuesOf,
  valuesOver,
} from './figure';
import type { PulzrFigurePanelProps } from './pulzr-figure-panel-types';

registerECharts([LineChart, GridComponent, CanvasRenderer]);

const numbers = { fontFeatureSettings: "'tnum' 1", fontVariantNumeric: 'tabular-nums' } as const;

/** A value as text: a time in parts when asked, else by its format. */
function figure(now: number | undefined, format?: FormatOptions, inParts?: boolean): string {
  if (now === undefined) return '—';
  return (inParts && timeInParts(now, format?.unit)) || formatValue(now, format);
}

const TONE = { good: 'success.main', bad: 'error.main', flat: 'text.disabled' } as const;

/** The change, small, as a pillar has it beside a figure: `↗ 133%`, good or bad news. Nothing with nothing before. */
function Badge({
  now,
  before,
  lowerIsBetter,
}: {
  now?: number;
  before?: number;
  lowerIsBetter?: boolean;
}): ReactElement | null {
  const change = sizeChange(now, before, lowerIsBetter, BADGE_ARROWS);
  if (!change) return null;
  return (
    <Typography
      component="span"
      sx={{ ...numbers, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', color: TONE[change.tone] }}
    >
      {change.text}
    </Typography>
  );
}

/** An area, its line 1.5 wide, fading from the color down: the series' shape over the period. */
function Sparkline({ values, color }: { values: number[]; color: string }): ReactElement {
  const chartsTheme = useChartsTheme();
  const option = useMemo(
    () => ({
      animation: false,
      grid: { top: 2, right: 0, bottom: 0, left: 0 },
      xAxis: { type: 'category', show: false, boundaryGap: false },
      yAxis: { type: 'value', show: false },
      series: [
        {
          type: 'line',
          data: values,
          smooth: true,
          smoothMonotone: 'x',
          symbol: 'none',
          silent: true,
          lineStyle: { color, width: 1.5 },
          // The console's area: a gradient 0.3 to 0, at the 0.6 opacity a Recharts area has.
          areaStyle: {
            opacity: 0.6,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: colors.modifyAlpha(color, 0.3) },
                { offset: 1, color: colors.modifyAlpha(color, 0) },
              ],
            },
          },
        },
      ],
    }),
    [values, color],
  );
  return (
    <Box sx={{ height: 32, m: '4px -2px 6px' }}>
      {values.length > 1 && (
        <EChart option={option} theme={chartsTheme.echartsTheme} sx={{ width: '100%', height: '100%' }} />
      )}
    </Box>
  );
}

/**
 * The line under the figure: its change in the style asked, good news in the success color, bad in the error
 * color, flat quiet; or the caption, secondary, with nothing to compare with.
 */
function changeLine(
  now: number | undefined,
  before: number | undefined,
  spec: PulzrFigurePanelProps['spec'],
): { line?: string; lineColor: string } {
  const label = spec.comparedLabel ?? 'vs the period before';
  if (spec.changeStyle === 'badge') {
    return { line: sizeChange(now, before) ? undefined : spec.caption, lineColor: 'text.secondary' };
  }
  if (spec.changeStyle === 'size') {
    const change = sizeChange(now, before, spec.lowerIsBetter);
    return change
      ? { line: `${change.text} ${label}`, lineColor: TONE[change.tone] }
      : { line: spec.caption, lineColor: 'text.secondary' };
  }
  const change = changeOf(now, before);
  if (!change) return { line: spec.caption, lineColor: 'text.secondary' };
  if (change.direction === 'flat') return { line: changeText(change, label), lineColor: TONE.flat };
  const good = change.direction === (spec.lowerIsBetter ? 'down' : 'up');
  return { line: changeText(change, label), lineColor: good ? TONE.good : TONE.bad };
}

/**
 * One figure, large and light, and under it its change against the period before (or a caption); as a pillar, bold
 * with its change beside it, a sparkline and a list of figures under it.
 */
export function PulzrFigurePanelComponent({ queryResults, spec }: PulzrFigurePanelProps): ReactElement {
  const theme = useTheme();
  const others = [...(spec.sparkline ? [spec.sparkline.series] : []), ...(spec.rows ?? []).map((r) => r.series)];
  const { now, before, total } = figureOf(queryResults, spec.of?.series, others);
  const values = spec.subtitle || spec.detail ? valuesOf(queryResults) : undefined;
  const { line, lineColor } = changeLine(now, before, spec);
  const badge = spec.changeStyle === 'badge';
  return (
    <Box sx={{ px: '10px', pt: '2px', pb: '7px', minWidth: 0, overflow: 'hidden' }}>
      {spec.subtitle && values && (
        <Typography
          component="div"
          sx={{
            fontSize: 9,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'text.secondary',
            mt: '-4px',
            mb: '2px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {fill(spec.subtitle, values)}
        </Typography>
      )}
      <Typography
        component="div"
        sx={{
          ...numbers,
          fontSize: 22,
          ...(badge
            ? { fontWeight: 650, lineHeight: 1.1, display: 'flex', alignItems: 'baseline', gap: '8px' }
            : { fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.02em' }),
          mb: '4px',
          color: spec.color ?? 'text.primary',
        }}
      >
        {figure(now, spec.format, spec.timeInParts)}
        {spec.of && total !== undefined && now !== undefined && (
          <Typography
            component="span"
            sx={{
              ...numbers,
              fontSize: 13,
              fontWeight: 400,
              letterSpacing: '0.02em',
              color: 'text.secondary',
              ml: badge ? 0 : '8px',
              whiteSpace: 'nowrap',
            }}
          >
            {`${Math.round(now * total)}/${total}${spec.of.label ? ` ${spec.of.label}` : ''}`}
          </Typography>
        )}
        {badge && <Badge now={now} before={before} lowerIsBetter={spec.lowerIsBetter} />}
      </Typography>
      {line && (
        <Typography
          component="div"
          sx={{
            ...numbers,
            fontSize: 10,
            fontWeight: 500,
            lineHeight: 1.4,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: lineColor,
          }}
        >
          {line}
        </Typography>
      )}
      {spec.detail && values && (
        <Typography
          component="div"
          sx={{
            ...numbers,
            display: 'inline-block',
            fontSize: 9,
            fontWeight: 500,
            lineHeight: 1.4,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'text.secondary',
            mt: '5px',
            px: '6px',
            py: '2px',
            bgcolor: 'action.hover',
            border: 1,
            borderColor: 'divider',
          }}
        >
          {fill(spec.detail, values)}
        </Typography>
      )}
      {spec.sparkline && (
        <Sparkline
          values={valuesOver(queryResults, spec.sparkline.series)}
          color={spec.sparkline.color ?? spec.color ?? theme.palette.text.primary}
        />
      )}
      {spec.rows && spec.rows.length > 0 && (
        <Box component="dl" sx={{ display: 'flex', flexDirection: 'column', gap: '1px', m: 0 }}>
          {spec.rows.map((row) => {
            const pair = pairOf(queryResults, row.series);
            return (
              <Box
                key={row.label}
                sx={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: '10px',
                  py: '3px',
                  borderTop: 1,
                  borderColor: 'divider',
                  fontSize: 12,
                }}
              >
                <Box component="dt" sx={{ color: 'text.secondary', minWidth: 0 }}>
                  {row.label}
                </Box>
                <Box
                  component="dd"
                  sx={{
                    ...numbers,
                    display: 'inline-flex',
                    alignItems: 'baseline',
                    gap: '6px',
                    m: 0,
                    color: 'text.primary',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {figure(pair.now, row.format, row.timeInParts)}
                  <Badge now={pair.now} before={pair.before} lowerIsBetter={row.lowerIsBetter} />
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
