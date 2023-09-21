import React from 'react';
import { render } from '@testing-library/react';
import { DivMonacoEditor } from 'editor';
import { DivPanelOptions } from 'types';

// Just a stub test
describe('Basic editor', () => {
    it('render without errors', () => {
      render(
        <DivMonacoEditor 
            value={{} as DivPanelOptions}
            onChange={jest.fn()}
            item={{} as any}
            context={{}}
        />
      )
    });
  });
  