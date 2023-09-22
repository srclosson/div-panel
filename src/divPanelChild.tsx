import React, { Component } from 'react';
import * as functions from 'utils/functions';
import { DivPanelChildProps, divStyle } from './types';
import { register, compile } from 'utils/handlebars';

interface State {
  ref: HTMLDivElement | null;
}

export class DivPanelChild extends Component<DivPanelChildProps, State> {
  constructor(props: DivPanelChildProps) {
    super(props);
    this.state = {
      ref: null,
    };

    register(this.props.data);
  }

  shouldComponentUpdate = (prevProps: DivPanelChildProps, prevState: State): boolean => {
    const truth =
      ((typeof prevProps !== "undefined" && typeof this.props !== "undefined) &&
      (JSON.stringify(prevProps) !== JSON.stringify(this.props))) ||
      prevProps.data.state === 'Done' ||
      prevProps.data.state === 'Streaming';
    return truth;
  };

  componentDidUpdate = async () => {
    const { ref } = this.state;
    this.panelUpdate(ref!);
  };

  panelUpdate = async (elem: HTMLDivElement) => {
    const { data } = this.props;
    const { scripts } = this.props.parsed;
    const { series } = data;

    scripts.forEach((s: HTMLScriptElement) => {
      try {
        functions.run({
          code: s,
          elem,
          data: series,
        });
      } catch (err) {
        //const error = typeof err === 'object' ? err.stack : err;
        // onChange({
        //   ...options,
        //   error,
        // });
      }
    });
  };

  loadDependencies = async (elem: HTMLDivElement) => {
    const { imports, meta, modules, scripts } = this.props.parsed;
    const { data } = this.props;
    await functions.loadDependencies(elem, imports, meta);
    await Promise.all(modules.map((i) => functions.loadModule(i, data, elem)));
    await Promise.all(scripts.map((i) => functions.init(elem.children?.item(0)!, i)));
    await this.panelUpdate(elem);
  };

  setRef = (element: HTMLDivElement | null) => {
    this.setState({
      ref: element,
    });
    if (element) {
      this.loadDependencies(element);
    }
  };

  render() {
    const { html } = this.props.parsed;
    const { series } = this.props.data;

    return (
      <>
        <div
          ref={this.setRef}
          className={divStyle.wrapper}
          dangerouslySetInnerHTML={{ __html: compile(html, series) }}
        ></div>
      </>
    );
  }
}
