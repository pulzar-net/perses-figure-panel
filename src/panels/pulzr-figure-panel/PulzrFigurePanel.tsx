import type { PanelPlugin } from '@perses-dev/plugin-system';

import type { PulzrFigurePanelOptions, PulzrFigurePanelProps } from './pulzr-figure-panel-types';
import { PulzrFigurePanelComponent } from './PulzrFigurePanelComponent';
import { PulzrFigurePanelSettingsEditor } from './PulzrFigurePanelSettingsEditor';

export const PulzrFigurePanel: PanelPlugin<PulzrFigurePanelOptions, PulzrFigurePanelProps> = {
  PanelComponent: PulzrFigurePanelComponent,
  panelOptionsEditorComponents: [{ label: 'Settings', content: PulzrFigurePanelSettingsEditor }],
  supportedQueryTypes: ['TimeSeriesQuery'],
  createInitialOptions: () => ({}),
};
