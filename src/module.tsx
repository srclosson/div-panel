import React from 'react';
import { PanelPlugin } from '@grafana/data';
import { DivPanelParent } from 'divPanelParent';
import { DivMonacoEditor } from 'editor';
import { DivPanelType, defaults } from './types';
//import { divPanelMigrationHandler } from './changeHandler';

export const plugin = new PanelPlugin<DivPanelType>(DivPanelParent)
  .setPanelOptions(builder => {
    builder.addCustomEditor({
      id: 'divPanelEdit',
      path: 'editor',
      name: 'Div Panel Code Editor',
      editor: props => {
        return (
          <DivMonacoEditor
            options={props.value || defaults}
            onOptionsChange={editor => {
              props.onChange(editor);
            }}
          />
        );
      },
    });
  })
  //.setMigrationHandler(divPanelMigrationHandler);
