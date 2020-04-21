import { PanelPlugin } from '@grafana/data';
import { DivPanelParent } from 'divPanelParent';
import { DivMonacoEditor } from 'editor';
import { DivPanelOptions } from './types';

export const plugin = new PanelPlugin<DivPanelOptions>(DivPanelParent).setEditor(DivMonacoEditor);
