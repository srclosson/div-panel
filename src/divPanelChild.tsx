import React from 'react';
import { DivPanelChildProps } from './types';

const myComponentString = `var myComponent = function () {
  var ref = React.useState('Not clicked');
  var message = ref[0];
  var setMessage = ref[1];

  var onClick = function () {
    setMessage('Clicked')
  }
  
return (
    React.createElement( 'div', null,
    message,
      React.createElement( 'button', { onClick: onClick }, "Click me!")
      )
  )
}`;

export const DivPanelChild = (props: DivPanelChildProps) => {
  // var MyChildComponent = function () { return React.createElement( 'div', null, myComponentString ); }
  // var myComponent = function () { return React.createElement( 'div', null, React.createElement( MyChildComponent, null ) ); }

  const reactComponent = new Function('React, myComponent', `${myComponentString}; return myComponent`)(
    React,
    new Function()
  );
  return reactComponent();
};
