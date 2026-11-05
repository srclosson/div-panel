import React, { useEffect, useRef, useState } from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2, SelectableValue, StandardEditorProps } from '@grafana/data';
import { CodeEditor, Button, ConfirmModal, Select, useStyles2 } from '@grafana/ui';
import { DivPanelExample, examples } from './examples';
import { DivPanelOptions, defaults } from './types';

const exampleOptions: Array<SelectableValue<DivPanelExample>> = examples.map((example) => ({
  label: example.label,
  description: example.description,
  value: example,
}));

// Code that's still exactly an example (or the starting template) can be replaced without asking.
const isUnchangedExample = (content: string) => examples.some((example) => example.content === content);

export const DivMonacoEditor: React.FC<StandardEditorProps<DivPanelOptions>> = ({ value, onChange }) => {
  const options = value || defaults;
  const styles = useStyles2(getStyles);
  const draft = useRef(options.content);
  const [pendingExample, setPendingExample] = useState<DivPanelExample>();
  useEffect(() => {
    draft.current = options.content;
  }, [options.content]);

  const commitContent = (content: string) => {
    draft.current = content;
    if (content !== options.content) {
      onChange({ ...options, content });
    }
  };

  // Saved edit-mode content belongs to the code that produced it, so it's cleared too.
  const loadExample = (example: DivPanelExample) => {
    draft.current = example.content;
    setPendingExample(undefined);
    onChange({ ...options, content: example.content, editContent: '' });
  };

  const onPickExample = (option: SelectableValue<DivPanelExample>) => {
    if (!option.value) {
      return;
    }
    if (isUnchangedExample(draft.current) && !options.editContent) {
      loadExample(option.value);
    } else {
      setPendingExample(option.value);
    }
  };

  return (
    <>
      <div className={styles.picker}>
        <Select
          aria-label="Start from an example"
          placeholder="Start from an example…"
          options={exampleOptions}
          value={null}
          onChange={onPickExample}
        />
      </div>
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
      <ConfirmModal
        isOpen={!!pendingExample}
        title="Replace your code?"
        body={`Loading "${pendingExample?.label}" replaces the code in the editor and any edits saved in the panel.`}
        confirmText="Replace"
        onConfirm={() => pendingExample && loadExample(pendingExample)}
        onDismiss={() => setPendingExample(undefined)}
      />
    </>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  picker: css({
    marginBottom: theme.spacing(1),
  }),
});
