import React, { useEffect, useRef } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { CodeEditor, Button } from '@grafana/ui';
import { DivPanelOptions, defaults } from './types';

export const DivMonacoEditor: React.FC<StandardEditorProps<DivPanelOptions>> = ({ value, onChange }) => {
  const options = value || defaults;
  const draft = useRef(options.content);
  useEffect(() => {
    draft.current = options.content;
  }, [options.content]);

  const commitContent = (content: string) => {
    draft.current = content;
    if (content !== options.content) {
      onChange({ ...options, content });
    }
  };

  return (
    <>
      <CodeEditor
        language="html"
        width="100%"
        height="50vh"
        value={options.content}
        onChange={(content) => (draft.current = content)}
        onBlur={commitContent}
        onSave={commitContent}
        showLineNumbers
      />
      <Button onClick={() => commitContent(draft.current)}>Run</Button>
    </>
  );
};
