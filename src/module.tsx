import { PanelPlugin } from '@grafana/data';
import { DivPanelParent } from 'divPanelParent';
import { DivMonacoEditor } from 'editor';
import { DivPanelOptions, defaults } from './types';

export const plugin = new PanelPlugin<DivPanelOptions>(DivPanelParent).setDefaults(defaults).setEditor(DivMonacoEditor);
