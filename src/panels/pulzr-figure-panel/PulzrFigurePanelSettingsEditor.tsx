import { FormControlLabel, Switch, TextField } from '@mui/material';
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
