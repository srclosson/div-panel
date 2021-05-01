/* eslint react/display-name: 0 */
import { PanelPlugin } from '@grafana/data';
import { DivPanelParent } from 'divPanelParent';
import { DivMonacoEditor } from 'editor';
import { DivPanelType, defaults } from './types';
//import { divPanelMigrationHandler } from './changeHandler';

export const plugin = new PanelPlugin<DivPanelType>(DivPanelParent).setPanelOptions((builder) => {
  builder.addCustomEditor({
    id: 'divPanelEdit',
    path: 'editor',
    name: 'Div Panel Code Editor',
    editor: DivMonacoEditor,
    defaultValue: defaults,
  });
});
//.setMigrationHandler(divPanelMigrationHandler);
