import React, { Component } from 'react';
import { PanelData, DataFrame } from '@grafana/data';
import { css } from 'emotion';
import postscribe from 'postscribe';

interface Props {
  id: string;
  html: string;
  meta: HTMLMetaElement[];
  scripts: HTMLScriptElement[];
  imports: HTMLScriptElement[];
  links: HTMLLinkElement[];
  data: PanelData;
  command: string;
}

interface State {
  metaLoaded: boolean;
  scriptsLoaded: boolean;
  importsLoaded: boolean;
  linksLoaded: boolean;
  divLoaded: boolean;
}

interface ScriptArgs {
  data?: DataFrame[];
  command: string;
  code: HTMLScriptElement;
}

const init = (code: HTMLScriptElement): any => {
  try {
    const f = new Function(`
      ${code.innerText}
      if (typeof onDivPanelInit === 'function') {
        onDivPanelInit();
      }
    `);
    f();
  } catch (ex) {
    throw ex;
  }
};

const loadMeta = (elem: HTMLMetaElement) => {
  return new Promise(resolve => {
    elem.onload = () => {
      resolve(elem);
    };
    document.head.appendChild(elem);
  });
};

const loadCSS = (elem: HTMLLinkElement) => {
  return new Promise(resolve => {
    elem.onload = () => {
      resolve(elem);
    };
    document.head.appendChild(elem);
  });
};

const load = async (elem: HTMLScriptElement, container: HTMLElement) => {
  try {
    return new Promise(resolve => {
      postscribe(container, elem.outerHTML, {
        done: () => {
          const url = elem.getAttribute('src');
          if (url) {
            fetch(url, { mode: 'no-cors' })
              .then((response: Response) => response.text())
              .then(code => {
                new Function(code)();
                resolve(elem);
              });
          }
        },
      });
    });
  } catch (ex) {
    console.log('caught error', ex);
  }
};

const run = (args: ScriptArgs): any => {
  try {
    const f = new Function(
      'data',
      'command',
      `
      if (typeof onDivPanelEnterEditMode === 'function' && command === 'enterEditMode') {
        onDivPanelEnterEditMode();
      }

      ${args.code.innerText}

      if (typeof onDivPanelExitEditMode === 'function' && command === 'exitEditMode') {
        onDivPanelExitEditMode();
      }

      if (data && typeof onDivPanelDataUpdate === 'function') {
        onDivPanelDataUpdate(data);
      }
    `
    );
    f(args.data, args.command);
  } catch (ex) {
    throw ex;
  }
};

const divStyle = {
  wrapper: css`
    display: inline-grid;
    position: relative;
    width: 100%;
    height: 100%;
  `,
};

export class DivPanelChild extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    
    this.state = {
      metaLoaded: false,
      scriptsLoaded: false,
      importsLoaded: false,
      linksLoaded: false,
      divLoaded: false,
    };
  }

  async componentDidMount() {
    const { id, imports, links, meta } = this.props;
    for (const i of meta) {
      await loadMeta(i);
    }

    for (const i of links) {
      await loadCSS(i);
    }

    let container = document.getElementById(id)?.parentElement;
    if (container) {
      container = container.parentElement?.parentElement?.parentElement;
    }
    if (container) {
      for (const i of imports) {
        try {
          await load(i, container);
        } catch (ex) {
          throw ex;
        }
      }
    }

    this.setState({
      ...this.state,
      importsLoaded: true,
      linksLoaded: true,
    });
  }

  componentDidUpdate() {
    const { importsLoaded, scriptsLoaded, linksLoaded, divLoaded } = this.state;
    const { id, scripts } = this.props;

    if (!divLoaded) {
      const elem = document.getElementById(id);
      if (elem) {
        this.setState({
          ...this.state,
          divLoaded: true,
        });
      }
    }

    if (divLoaded && importsLoaded && linksLoaded && !scriptsLoaded) {
      scripts.forEach(async i => await init(i));
      this.setState({
        ...this.state,
        scriptsLoaded: true,
      });
    }
  }

  executeScripts = (scripts: HTMLScriptElement[]) => {
    const { command } = this.props;
    const { state, series } = this.props.data;
    const { importsLoaded, scriptsLoaded, linksLoaded } = this.state;
    window.requestAnimationFrame(() => {
      if (state === 'Done' && scriptsLoaded && importsLoaded && linksLoaded) {
        for (const s of scripts) {
          run({ code: s, command, data: series });
        }
      }
    });
  };

  render() {
    const { id, html, scripts } = this.props;
    this.executeScripts(scripts);
    return (
      <>
        <div id={id} className={divStyle.wrapper} dangerouslySetInnerHTML={{ __html: html }}></div>
      </>
    );
  }
}
