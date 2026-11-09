import { Box, Typography } from '@mui/material';
import { formatValue } from '@perses-dev/components';
import type { ReactElement } from 'react';

import { changeOf, changeText, figureOf, fill, sizeChange, timeInParts, valuesOf } from './figure';
import type { PulzrFigurePanelProps } from './pulzr-figure-panel-types';

const numbers = { fontFeatureSettings: "'tnum' 1", fontVariantNumeric: 'tabular-nums' } as const;

/** The figure as text: a time in parts when asked, else by its format. */
function figure(now: number | undefined, spec: PulzrFigurePanelProps['spec']): string {
  if (now === undefined) return '—';
  return (spec.timeInParts && timeInParts(now, spec.format?.unit)) || formatValue(now, spec.format);
}

const TONE = { good: 'success.main', bad: 'error.main', flat: 'text.disabled' } as const;

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

/** One figure, large and light, and under it its change against the period before (or a caption). */
export function PulzrFigurePanelComponent({ queryResults, spec }: PulzrFigurePanelProps): ReactElement {
  const { now, before, total } = figureOf(queryResults, spec.of?.series);
  const values = spec.subtitle || spec.detail ? valuesOf(queryResults) : undefined;
  const { line, lineColor } = changeLine(now, before, spec);
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
            mb: '6px',
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
          fontWeight: 300,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          mb: '4px',
          color: spec.color ?? 'text.primary',
        }}
      >
        {figure(now, spec)}
        {spec.of && total !== undefined && now !== undefined && (
          <Typography
            component="span"
            sx={{
              ...numbers,
              fontSize: 13,
              fontWeight: 400,
              letterSpacing: '0.02em',
              color: 'text.secondary',
              ml: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            {`${Math.round(now * total)}/${total}${spec.of.label ? ` ${spec.of.label}` : ''}`}
          </Typography>
        )}
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
    </Box>
  );
}
