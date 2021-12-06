import React, { useEffect, useCallback } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { DivPanelOptions, getDivPanelState, setDivPanelState, defaults } from './types';
import { CodeEditor, Button } from '@grafana/ui';
import * as buble from 'buble';
//import { Console, Hook, Unhook } from 'console-feed';

export const DivMonacoEditor: React.FC<StandardEditorProps<DivPanelOptions>> = ({ value, onChange }) => {
  const options = value || defaults;
  const { content } = options;

  const commitContent = (content: string) => {
    const transformed = buble.transform(content);
    console.log(transformed.code);
    onChange({
      ...value,
      content,
      transformed: transformed.code,
    });
  };

  const onSave = (content: string) => {
    commitContent(content);
  };

  const onClearClick = () => {
    setDivPanelState({
      ...getDivPanelState(),
      command: 'clear',
    });

    commitContent(content);
  };

  const onRunClick = () => {
    setDivPanelState({
      ...getDivPanelState(),
      command: 'render',
    });
    commitContent(content);
  };

  const onEditModeChange = useCallback((editMode: boolean) => {
    setDivPanelState({
      ...getDivPanelState(),
      editMode,
    });
  }, []);

  useEffect(() => {
    onEditModeChange(true);
    return () => {
      onEditModeChange(false);
    };
  });

  return (
    <>
      <CodeEditor language="javascript" width="100%" height="50vh" value={content} onSave={onSave} showLineNumbers />
      <Button onClick={onRunClick}>Run</Button>
      <Button onClick={onClearClick}>Clear</Button>
      {/* <Console logs={logs} variant="dark" /> */}
    </>
  );
};
