import { FormControlLabel, MenuItem, Switch, TextField } from '@mui/material';
import { FormatControls, OptionsEditorColumn, OptionsEditorGrid, OptionsEditorGroup } from '@perses-dev/components';
import type { OptionsEditorProps } from '@perses-dev/plugin-system';
import type { ReactElement } from 'react';

import type { PulzrFigurePanelOptions } from './pulzr-figure-panel-types';

const text = (v: string): string | undefined => (v.trim() ? v : undefined);

export function PulzrFigurePanelSettingsEditor({
  value,
  onChange,
}: OptionsEditorProps<PulzrFigurePanelOptions>): ReactElement {
  return (
    <OptionsEditorGrid>
      <OptionsEditorColumn>
        <OptionsEditorGroup title="Format">
          <FormatControls
            value={value.format ?? { unit: 'decimal' }}
            onChange={(format) => onChange({ ...value, format })}
          />
        </OptionsEditorGroup>
      </OptionsEditorColumn>
      <OptionsEditorColumn>
        <OptionsEditorGroup title="Figure">
          <TextField
            size="small"
            label="Color"
            helperText="Any CSS color. Empty: the text color."
            value={value.color ?? ''}
            onChange={(e) => onChange({ ...value, color: text(e.target.value) })}
          />
          <TextField
            size="small"
            label="Compared label"
            helperText="After the change: vs last week."
            value={value.comparedLabel ?? ''}
            onChange={(e) => onChange({ ...value, comparedLabel: text(e.target.value) })}
          />
          <TextField
            size="small"
            label="Caption"
            helperText="When there is nothing to compare with."
            value={value.caption ?? ''}
            onChange={(e) => onChange({ ...value, caption: text(e.target.value) })}
          />
          <TextField
            size="small"
            label="Subtitle"
            helperText="Under the title. {{series}}, {{series|%}}."
            value={value.subtitle ?? ''}
            onChange={(e) => onChange({ ...value, subtitle: text(e.target.value) })}
          />
          <TextField
            size="small"
            label="Detail"
            helperText="A box under the figure, as the subtitle."
            value={value.detail ?? ''}
            onChange={(e) => onChange({ ...value, detail: text(e.target.value) })}
          />
          <TextField
            select
            size="small"
            label="Change reads"
            value={value.changeStyle ?? 'signed'}
            onChange={(e) =>
              onChange({
                ...value,
                changeStyle: e.target.value === 'size' || e.target.value === 'badge' ? e.target.value : undefined,
              })
            }
          >
            <MenuItem value="signed">↑ +0.7%</MenuItem>
            <MenuItem value="size">↑ 0.7%</MenuItem>
            <MenuItem value="badge">↗ 0.7% beside the figure</MenuItem>
          </TextField>
          <TextField
            size="small"
            label="Sparkline series"
            helperText="An area under the figure, of this series over time."
            value={value.sparkline?.series ?? ''}
            onChange={(e) =>
              onChange({
                ...value,
                sparkline: text(e.target.value) ? { ...value.sparkline, series: e.target.value } : undefined,
              })
            }
          />
          <TextField
            size="small"
            label="Sparkline color"
            helperText="Empty: the figure's color."
            disabled={!value.sparkline}
            value={value.sparkline?.color ?? ''}
            onChange={(e) =>
              value.sparkline && onChange({ ...value, sparkline: { ...value.sparkline, color: text(e.target.value) } })
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(value.lowerIsBetter)}
                onChange={(e) => onChange({ ...value, lowerIsBetter: e.target.checked || undefined })}
              />
            }
            label="Lower is better"
          />
        </OptionsEditorGroup>
      </OptionsEditorColumn>
    </OptionsEditorGrid>
  );
}
