import { BOOTSTRAP } from './bootstrap';

// In jsdom the test window is its own parent, so messages it sends to itself look like they came from the panel.
const fromPanel = (data: object) =>
  window.dispatchEvent(new MessageEvent('message', { data: { ...data, source: 'div-panel' }, source: window }));

describe('bootstrap', () => {
  const w = window as any;
  const posted: any[] = [];

  beforeAll(() => {
    jest.spyOn(window, 'postMessage').mockImplementation((m: any) => posted.push(m));
    w.onDivPanelInit = jest.fn();
    w.onDivPanelDataUpdate = jest.fn();
    w.onDivPanelEnterEditMode = jest.fn();
    w.onDivPanelExitEditMode = jest.fn(() => '<p>edited</p>');
    new Function(BOOTSTRAP)();
  });

  it('asks the panel for its edit content once loaded, and waits for it before init', () => {
    window.dispatchEvent(new Event('load'));
    expect(posted).toContainEqual({ source: 'div-panel', type: 'loaded' });
    expect(w.onDivPanelInit).not.toHaveBeenCalled();
  });

  it('holds data that arrives before init', () => {
    fromPanel({ type: 'data', series: [{ name: 'A' }] });
    expect(w.onDivPanelDataUpdate).not.toHaveBeenCalled();
  });

  it('hands the saved content to init, the divpanelinit event and divPanelEditContent', () => {
    const onEvent = jest.fn();
    window.addEventListener('divpanelinit', (e) => onEvent((e as CustomEvent).detail.content));

    fromPanel({ type: 'init', content: '<p>saved</p>' });

    expect(w.onDivPanelInit).toHaveBeenCalledWith(document.body, '<p>saved</p>');
    expect(onEvent).toHaveBeenCalledWith('<p>saved</p>');
    expect(w.divPanelEditContent).toBe('<p>saved</p>');
    expect(posted).toContainEqual({ source: 'div-panel', type: 'ready', hasEditMode: true });
    expect(w.onDivPanelDataUpdate).toHaveBeenCalledWith([{ name: 'A' }], document.body);
  });

  it('only initializes once', () => {
    fromPanel({ type: 'init', content: 'again' });
    expect(w.onDivPanelInit).toHaveBeenCalledTimes(1);
  });

  it('saves what onDivPanelExitEditMode returns', () => {
    fromPanel({ type: 'exitEditMode' });
    expect(posted).toContainEqual({ source: 'div-panel', type: 'editContent', content: '<p>edited</p>' });
    expect(w.divPanelEditContent).toBe('<p>edited</p>');
  });

  it('ignores messages that are not from the panel', () => {
    window.dispatchEvent(
      new MessageEvent('message', { data: { source: 'div-panel', type: 'exitEditMode' }, source: null })
    );
    expect(w.onDivPanelExitEditMode).toHaveBeenCalledTimes(1);
  });
});
