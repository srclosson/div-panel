// Runs first inside the sandboxed iframe. It is a plain string (not a function we stringify) so the
// bundler can't rewrite it or inject helpers that won't exist inside the frame.
//
// The frame has an opaque origin, so the only way in or out is postMessage. Every message carries
// `source: 'div-panel'` and the iframe only listens to its parent window.
export const BOOTSTRAP = `
(function () {
  var pendingSeries = null;
  var initialized = false;

  window.divGlobals = {};
  Object.defineProperty(window, 'divPanelContainer', {
    get: function () { return document.body; },
  });

  function post(message) {
    message.source = 'div-panel';
    parent.postMessage(message, '*');
  }

  function report(err) {
    var message = err && err.stack ? err.stack : String(err && err.message ? err.message : err);
    post({ type: 'error', message: message });
  }

  function hook(name) {
    return typeof window[name] === 'function' ? window[name] : null;
  }

  function call(name, args) {
    var f = hook(name);
    if (!f) {
      return undefined;
    }
    try {
      return f.apply(null, args);
    } catch (err) {
      report(err);
      return undefined;
    }
  }

  function dataUpdate(series) {
    call('onDivPanelDataUpdate', [series, document.body]);
  }

  window.addEventListener('error', function (e) { report(e.error || e.message); });
  window.addEventListener('unhandledrejection', function (e) { report(e.reason); });

  window.addEventListener('message', function (e) {
    if (e.source !== parent || !e.data || e.data.source !== 'div-panel') {
      return;
    }
    var m = e.data;
    switch (m.type) {
      case 'data':
        if (initialized) {
          dataUpdate(m.series);
        } else {
          pendingSeries = m.series;
        }
        break;
      case 'enterEditMode':
        call('onDivPanelEnterEditMode', [document.body, m.content || '']);
        break;
      case 'exitEditMode':
        var html = call('onDivPanelExitEditMode', [document.body]);
        post({ type: 'editContent', content: typeof html === 'string' ? html : '' });
        break;
    }
  });

  window.addEventListener('load', function () {
    call('onDivPanelInit', [document.body]);
    initialized = true;
    post({
      type: 'ready',
      hasEditMode: !!(hook('onDivPanelEnterEditMode') && hook('onDivPanelExitEditMode')),
    });
    if (pendingSeries) {
      dataUpdate(pendingSeries);
      pendingSeries = null;
    }
  });
})();
`;

export const BASE_STYLE = `html, body { width: 100%; height: 100%; margin: 0; }`;
