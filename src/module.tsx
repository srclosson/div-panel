import { PanelPlugin } from '@grafana/data';
import { DivPanel } from './DivPanel';
import { DivMonacoEditor } from './editor';
import { DivPanelType, defaults } from './types';

export const plugin = new PanelPlugin<DivPanelType>(DivPanel)
  .setPanelOptions((builder) => {
    builder.addCustomEditor({
      id: 'divPanelEdit',
      path: 'editor',
      name: 'Div Panel Code Editor',
      editor: DivMonacoEditor,
      defaultValue: defaults,
    });
  })
  .setMigrationHandler((panel) => {
    // editContent used to be a string[] (one entry per script) and an unused editCss existed.
    const editor = panel.options?.editor as Record<string, any> | undefined;
    if (editor && Array.isArray(editor.editContent)) {
      editor.editContent = editor.editContent.find((c: unknown) => typeof c === 'string' && c) ?? '';
    }
    if (editor) {
      delete editor.editCss;
      delete editor.error;
    }
    return panel.options as DivPanelType;
  });
