import React, { Component } from 'react';
import * as functions from 'utils/functions';
import { DivPanelChildProps, divStyle } from './types';
const Handlebars = require('handlebars');

interface State {
  ref: HTMLDivElement | null;
}

export class DivPanelChild extends Component<DivPanelChildProps, State> {
  editModeHtml: Array<string | undefined>;
  constructor(props: DivPanelChildProps) {
    super(props);
    this.editModeHtml = [];
    this.state = {
      ref: null,
    };

    Handlebars.registerHelper('last', () => {
      return this.props.data.series[0].fields[1].values.get(this.props.data.series[0].fields[1].values.length - 1);
    });
  }

  shouldComponentUpdate = (prevProps: DivPanelChildProps, prevState: State): boolean => {
    const truth =
      JSON.stringify(prevProps) !== JSON.stringify(this.props) ||
      prevProps.data.state === 'Done' ||
      prevProps.data.state === 'Streaming';
    return truth;
  };

  componentDidUpdate = async () => {
    const { data } = this.props;
    const { scripts } = this.props.parsed;
    const { ref } = this.state;
    const { series } = data;

    scripts.forEach((s: HTMLScriptElement) => {
      try {
        let returnedEditContent = functions.run({
          code: s,
          elem: ref?.children!,
          data: series,
        });
        return returnedEditContent;
      } catch (err) {
        //const error = typeof err === 'object' ? err.stack : err;
        // onChange({
        //   ...options,
        //   error,
        // });
        return;
      }
    });
  };

  loadDependencies = async (elem: HTMLDivElement) => {
    const { imports, meta, scripts } = this.props.parsed;
    await functions.loadDependencies(elem, imports, meta);
    await Promise.all(scripts.map((i) => functions.init(elem.children?.item(0)!, i)));
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
    let template, newHtml;
    try {
      template = Handlebars.compile(html);
      newHtml = template(series);
    } catch (ex) {
      newHtml = html;
    }

    return (
      <>
        <div ref={this.setRef} className={divStyle.wrapper} dangerouslySetInnerHTML={{ __html: newHtml }}></div>
      </>
    );
  }
}
