import { DataFrame } from '@grafana/data';
import { compile } from '../utils/handlebars';
import { BASE_STYLE, BOOTSTRAP } from './bootstrap';

export interface SrcDocTheme {
  isDark: boolean;
  textColor: string;
  fontFamily: string;
  fontSize: string;
}

// <script run="ondata"> and friends are shorthand for wrapping the body in the named hook.
const RUN_HOOKS: Record<string, { name: string; params: string }> = {
  oninit: { name: 'onDivPanelInit', params: 'elem, content' },
  onentereditmode: { name: 'onDivPanelEnterEditMode', params: 'elem, content' },
  onexiteditmode: { name: 'onDivPanelExitEditMode', params: 'elem' },
  ondata: { name: 'onDivPanelDataUpdate', params: 'data, elem' },
};

const isClassicInlineScript = (script: HTMLScriptElement) =>
  !script.hasAttribute('src') && script.getAttribute('type') !== 'module';

const expandRunAttribute = (script: HTMLScriptElement) => {
  const hook = RUN_HOOKS[script.getAttribute('run')?.toLowerCase() ?? ''];
  if (hook && isClassicInlineScript(script)) {
    script.textContent = `function ${hook.name}(${hook.params}) {\n${script.textContent}\n}`;
  }
  script.removeAttribute('run');
};

// Handlebars only applies to the markup. Scripts are swapped for placeholder comments while the
// body is compiled so that `{{` inside JavaScript is left alone.
const compileBody = (body: HTMLElement, series: DataFrame[]) => {
  const scripts = Array.from(body.querySelectorAll('script'));
  scripts.forEach((script, i) => script.replaceWith(body.ownerDocument.createComment(`div-panel-script-${i}`)));

  body.innerHTML = compile(body.innerHTML, series);

  const walker = body.ownerDocument.createTreeWalker(body, NodeFilter.SHOW_COMMENT);
  const placeholders: Comment[] = [];
  while (walker.nextNode()) {
    placeholders.push(walker.currentNode as Comment);
  }
  placeholders.forEach((comment) => {
    const match = /^div-panel-script-(\d+)$/.exec(comment.data);
    if (match) {
      comment.replaceWith(scripts[Number(match[1])]);
    }
  });
};

/**
 * Turns the panel's HTML into a complete document for the sandboxed iframe: the bridge script goes
 * first in <head>, `run="..."` shorthand is expanded, and Handlebars is applied to the markup.
 */
export const buildSrcDoc = (content: string, series: DataFrame[], theme: SrcDocTheme): string => {
  const doc = new DOMParser().parseFromString(content, 'text/html');

  doc.querySelectorAll('script[run]').forEach((s) => expandRunAttribute(s as HTMLScriptElement));
  compileBody(doc.body, series);

  const style = doc.createElement('style');
  // The frame's color-scheme has to match Grafana's, or the browser paints it an opaque white.
  style.textContent = `${BASE_STYLE}
:root { color-scheme: ${theme.isDark ? 'dark' : 'light'}; background: transparent; }
body { color: ${theme.textColor}; font-family: ${theme.fontFamily}; font-size: ${theme.fontSize}; }`;
  const bootstrap = doc.createElement('script');
  bootstrap.textContent = BOOTSTRAP;
  doc.head.prepend(bootstrap, style);

  return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
};

/**
 * DataFrames can carry functions (field.display, getLinks) and other state that can't be posted to
 * the iframe. Copy out the parts a script can use.
 */
export const toPlainSeries = (series: DataFrame[]) =>
  series.map((frame) => ({
    name: frame.name,
    refId: frame.refId,
    meta: frame.meta,
    length: frame.length,
    fields: frame.fields.map((field) => ({
      name: field.name,
      type: field.type,
      config: field.config,
      labels: field.labels,
      values: Array.from(field.values),
    })),
  }));
