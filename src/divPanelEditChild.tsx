import React from 'react';
import { DivPanelChildProps, divStyle } from './types';

export const DivPanelEditChild: React.FC<DivPanelChildProps> = (props: DivPanelChildProps) => {
  const html = '<div></div>';
  return (
    <>
      <div className={divStyle.wrapper} dangerouslySetInnerHTML={{ __html: html }}></div>
    </>
  );
};
