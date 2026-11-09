import { Box, Typography } from '@mui/material';
import { formatValue } from '@perses-dev/components';
import type { ReactElement } from 'react';

import { changeOf, changeText, figureOf, timeInParts } from './figure';
import type { PulzrFigurePanelProps } from './pulzr-figure-panel-types';

const numbers = { fontFeatureSettings: "'tnum' 1", fontVariantNumeric: 'tabular-nums' } as const;

/** The figure as text: a time in parts when asked, else by its format. */
function figure(now: number | undefined, spec: PulzrFigurePanelProps['spec']): string {
  if (now === undefined) return '—';
  return (spec.timeInParts && timeInParts(now, spec.format?.unit)) || formatValue(now, spec.format);
}

/** One figure, large and light, and under it its change against the period before (or a caption). */
export function PulzrFigurePanelComponent({ queryResults, spec }: PulzrFigurePanelProps): ReactElement {
  const { now, before, total } = figureOf(queryResults, spec.of?.series);
  const change = changeOf(now, before);
  const line = change ? changeText(change, spec.comparedLabel) : spec.caption;
  // A change: good news in the success color, bad in the error color, flat quiet. A caption: secondary.
  let lineColor = 'text.secondary';
  if (change) {
    const better = spec.lowerIsBetter ? 'down' : 'up';
    if (change.direction === 'flat') lineColor = 'text.disabled';
    else lineColor = change.direction === better ? 'success.main' : 'error.main';
  }
  return (
    <Box sx={{ px: '10px', pt: '2px', pb: '7px', minWidth: 0, overflow: 'hidden' }}>
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
    </Box>
  );
}
