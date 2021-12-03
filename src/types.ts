import { PanelProps, PanelData } from '@grafana/data';
import { css } from 'emotion';

export const defaultEditContent = `<html>
<body>
  <div>
      Hello Div Panel
  </div>

  <script>
      /**
       * @param elem The div element containing your div panel
       */
      function onDivPanelInit(elem) {
        console.log("I am in init", elem);
      }

      /**
       * @param elem The div element containing your panel
       * @param content The content set by the editor you used while in edit mode
       */
      function onDivPanelEnterEditMode(elem, content) {
        console.log("I entered edit mode", elem, content);
      }

      /**
       * @param elem The div element containing your div panel
       * @returns The html content to save and be loaded in onDivPanelEnterEditMode
       */
      function onDivPanelExitEditMode(elem) {
        console.log("I exited edit mode", elem);
        let html = '<p>Hello</p>';
        return html;
      }

      /**
       * @param data The data retrieved from your panel data config
       */
      function onDivPanelDataUpdate(data) {
        console.log("I have data", data);
      }
      
      console.log("Hello from my script!");
  </script>
</body>
</html>`;

export const defaultContent = `<html>
<body>
  <div>
      Hello Div Panel
  </div>

  <script>
      /**
       * @param elem The div element containing your div panel
       */
      function onDivPanelInit(elem) {
        console.log("I am in init", elem);
      }

      /**
       * @param data The data retrieved from your panel data config
       */
      function onDivPanelDataUpdate(data) {
        console.log("I have data", data);
      }
      
      console.log("Hello from my script!");
  </script>
</body>
</html>`;
export interface DivPanelParsedHtml {
  html: string;
  meta: HTMLMetaElement[];
  scripts: HTMLScriptElement[];
  modules: HTMLScriptElement[];
  imports: HTMLScriptElement[];
  links: HTMLLinkElement[];
}

export interface DivPanelOptions {
  content: string;
  editContent: string[];
  editCss: string[];
  error?: string;
}

export interface DivPanelType {
  editor: DivPanelOptions;
}

export const defaults: DivPanelOptions = {
  content: defaultContent,
  editContent: [],
  editCss: [],
};

export interface DivPanelChildProps {
  onChange: (options: DivPanelOptions) => void;
  options: DivPanelOptions;
  parsed: DivPanelParsedHtml;
  data: PanelData;
}

export interface DivPanelProps extends PanelProps<DivPanelOptions> {}

export interface DivPanelState {
  command: string;
  editMode: boolean;
  error?: string;
}

const defaultDivPanelState = {
  command: '',
  editMode: false,
};

let divPanelState: DivPanelState = defaultDivPanelState;

export const setDivPanelState = (state: DivPanelState) => {
  divPanelState = { ...state };
};

export const getDivPanelState = (): DivPanelState => {
  return divPanelState;
};

export const clearDivPanelState = () => {
  divPanelState = {
    ...divPanelState,
    command: '',
  };
};

export const divStyle = {
  wrapper: css`
    display: grid;
    position: relative;
    width: 100%;
    height: 100%;
  `,
};
