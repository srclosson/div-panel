import React, { useEffect, useCallback } from 'react';
import { DivPanelChildProps, divStyle } from './types';
import { register, compile } from 'utils/handlebars';
import * as functions from 'utils/functions';

interface Props extends DivPanelChildProps {
  editMode: boolean;
  changeEditContent: (html: string[]) => void;
}

export const DivPanelEditChild: React.FC<Props> = (props: Props) => {
  let element: HTMLDivElement | null = null;
  const { parsed, data, changeEditContent } = props;
  const { html } = parsed;
  const { series } = data;

  // const onOptionsChange = (key: string, value: boolean) => {
  //   onChange({
  //     ...options,
  //     [key]: value,
  //   });
  // };

  const mount = useCallback(() => {
    register(data);
  }, [data]);

  const panelShutdown = (elem: HTMLDivElement) => {
    const { scripts } = parsed;
    const childElement: Element = elem.children.item(0)!;
    const editContent: string[] = scripts.map((i) => functions.runExitEditMode(childElement, i));
    changeEditContent(editContent);
  };

  const unmount = () => {
    panelShutdown(element!);
  };

  const panelUpdate = useCallback((elem: HTMLDivElement) => {
    const { scripts } = parsed;
    const { series } = data;

    scripts.forEach((s: HTMLScriptElement) => {
      try {
        functions.run({
          code: s,
          elem,
          data: series,
        });
      } catch (err) {
        console.log("scripts.forEach error", err);
      }
    });
  }, [data, parsed]);

  const loadDependencies = async (elem: HTMLDivElement) => {
    const { imports, meta, scripts } = parsed;
    const childElement: Element = elem.children.item(0)!;
    await functions.loadDependencies(elem, imports, meta);
    scripts.map((i) => functions.init(childElement, i));
    scripts.map((i) => functions.runEnterEditMode(childElement, i));
    await panelUpdate(elem);
  };

  const setRef = (elem: HTMLDivElement | null) => {
    if (elem) {
      element = elem;
      loadDependencies(elem);
    }
  };

  useEffect(() => {
    mount();
    return () => {
      unmount();
    };
  });

  return (
    <>
      <div ref={setRef} className={divStyle.wrapper} dangerouslySetInnerHTML={{ __html: compile(html, series) }}></div>
    </>
  );
};
