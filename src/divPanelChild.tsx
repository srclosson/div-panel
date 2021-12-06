import React from 'react';
import { DivPanelChildProps } from './types';
import { css } from 'emotion';

export const DivPanelChild = (props: DivPanelChildProps) => {
  const { options } = props;
  // var MyChildComponent = function () { return React.createElement( 'div', null, myComponentString ); }
  // var myComponent = function () { return React.createElement( 'div', null, React.createElement( MyChildComponent, null ) ); }

  const reactComponent = new Function('React, css, myComponent', `${options.transformed}; return myComponent`)(
    React,
    css,
    new Function()
  );
  return reactComponent();
};
