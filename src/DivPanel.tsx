import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2, PanelProps } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { Alert, Button, useStyles2, useTheme2 } from '@grafana/ui';
import { buildSrcDoc, toPlainSeries } from './sandbox/srcdoc';
import { DivPanelType, defaults } from './types';

interface Props extends PanelProps<DivPanelType> {}

// Only `allow-scripts`. Without `allow-same-origin` the frame gets an opaque origin, so it can't
// reach Grafana's DOM, cookies, storage or authenticated API. Popups, forms, modals and top-level
// navigation stay blocked.
const SANDBOX = 'allow-scripts';

type FrameMessage =
  | { source: 'div-panel'; type: 'loaded' }
  | { source: 'div-panel'; type: 'ready'; hasEditMode: boolean }
  | { source: 'div-panel'; type: 'editContent'; content: string }
  | { source: 'div-panel'; type: 'error'; message: string };

const isEditingPanel = (id: number) => String(locationService.getSearchObject().editPanel) === String(id);

const useIsEditingPanel = (id: number) => {
  const [editing, setEditing] = useState(() => isEditingPanel(id));
  useEffect(() => {
    const update = () => setEditing(isEditingPanel(id));
    update();
    return locationService.getHistory().listen(update);
  }, [id]);
  return editing;
};

export const DivPanel = ({ id, data, options, onOptionsChange, width, height }: Props) => {
  const editor = options.editor ?? defaults;
  const theme = useTheme2();
  const styles = useStyles2(getStyles);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [hasEditMode, setHasEditMode] = useState(false);
  const [editingInFrame, setEditingInFrame] = useState(false);
  const [error, setError] = useState<string>();
  const editingPanel = useIsEditingPanel(id);

  const srcDoc = useMemo(
    () =>
      buildSrcDoc(editor.content, data.series, {
        isDark: theme.isDark,
        textColor: theme.colors.text.primary,
        fontFamily: theme.typography.fontFamily,
        fontSize: `${theme.typography.fontSize}px`,
      }),
    [editor.content, data.series, theme]
  );

  // A new document means a fresh frame that has to say it's ready again.
  useEffect(() => {
    setReady(false);
    setHasEditMode(false);
    setEditingInFrame(false);
    setError(undefined);
  }, [srcDoc]);

  const post = useCallback((message: object) => {
    frameRef.current?.contentWindow?.postMessage({ ...message, source: 'div-panel' }, '*');
  }, []);

  const latest = useRef({ editor, onOptionsChange, options });
  latest.current = { editor, onOptionsChange, options };

  useEffect(() => {
    const onMessage = (e: MessageEvent<FrameMessage>) => {
      if (!frameRef.current || e.source !== frameRef.current.contentWindow || e.data?.source !== 'div-panel') {
        return;
      }
      const { editor, onOptionsChange, options } = latest.current;
      switch (e.data.type) {
        case 'loaded':
          post({ type: 'init', content: editor.editContent });
          break;
        case 'ready':
          setReady(true);
          setHasEditMode(e.data.hasEditMode);
          break;
        case 'editContent':
          onOptionsChange({ ...options, editor: { ...editor, editContent: e.data.content } });
          break;
        case 'error':
          setError(e.data.message);
          break;
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [post]);

  useEffect(() => {
    if (ready) {
      post({ type: 'data', series: toPlainSeries(data.series) });
    }
  }, [ready, data.series, post]);

  // Entering panel edit starts edit mode in the frame. Leaving it saves on a best-effort basis: the
  // frame answers asynchronously, so if Grafana tears the panel down first the edits are lost. The
  // "Save edits" button is the reliable path.
  const editingInFrameRef = useRef(editingInFrame);
  editingInFrameRef.current = editingInFrame;
  useEffect(() => {
    if (!ready || !hasEditMode) {
      return;
    }
    if (editingPanel && !editingInFrameRef.current) {
      post({ type: 'enterEditMode', content: latest.current.editor.editContent });
      setEditingInFrame(true);
    } else if (!editingPanel && editingInFrameRef.current) {
      post({ type: 'exitEditMode' });
      setEditingInFrame(false);
    }
  }, [editingPanel, ready, hasEditMode, post]);

  const onSaveEdits = () => {
    post({ type: 'exitEditMode' });
    setEditingInFrame(false);
  };

  const onEdit = () => {
    post({ type: 'enterEditMode', content: editor.editContent });
    setEditingInFrame(true);
  };

  const showToolbar = editingPanel && hasEditMode;
  const toolbarHeight = showToolbar ? theme.spacing.gridSize * 4 : 0;

  return (
    <div className={styles.wrapper} style={{ width, height }}>
      {showToolbar && (
        <div className={styles.toolbar} style={{ height: toolbarHeight }}>
          {editingInFrame ? (
            <Button size="sm" icon="save" onClick={onSaveEdits}>
              Save edits
            </Button>
          ) : (
            <Button size="sm" variant="secondary" icon="pen" onClick={onEdit}>
              Edit
            </Button>
          )}
        </div>
      )}
      <iframe
        ref={frameRef}
        className={styles.frame}
        title="Div panel content"
        sandbox={SANDBOX}
        srcDoc={srcDoc}
        width={width}
        height={height - toolbarHeight}
      />
      {error && (
        <Alert className={styles.error} title="Panel script error" severity="error" onRemove={() => setError(undefined)}>
          <pre className={styles.errorText}>{error}</pre>
        </Alert>
      )}
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  wrapper: css({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  }),
  toolbar: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0,
  }),
  frame: css({
    border: 'none',
    display: 'block',
    background: 'transparent',
  }),
  error: css({
    position: 'absolute',
    left: theme.spacing(1),
    right: theme.spacing(1),
    bottom: theme.spacing(1),
    margin: 0,
  }),
  errorText: css({
    margin: 0,
    maxHeight: 120,
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
  }),
});
