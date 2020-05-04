import { PanelProps } from '@grafana/data';
import { v4 as uuidv4 } from 'uuid';

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

export interface DivPanelOptions {
  content: string;
  editContent: string[];
  editCss: string[];
  id: string;
}

export const defaults: DivPanelOptions = {
  id: uuidv4(),
  content: defaultContent,
  editContent: [],
  editCss: [],
};

export interface DivPanelProps extends PanelProps<DivPanelOptions> {}

export interface DivPanelState {
  editId: string;
  command: string;
  editMode: boolean;
  editContent: string[];
  metaLoaded: boolean;
  scriptsLoaded: boolean;
  importsLoaded: boolean;
  linksLoaded: boolean;
}

let pathName = window.location.pathname;
const defaultDivPanelState = {
  editId: '',
  command: '',
  editMode: false,
  editContent: [],
  metaLoaded: false,
  scriptsLoaded: false,
  importsLoaded: false,
  linksLoaded: false,
};
let divPanelState: DivPanelState = defaultDivPanelState;

export const setDivPanelState = (state: DivPanelState) => {
  divPanelState = { ...state };
};

export const getDivPanelState = (): DivPanelState => {
  if (pathName !== window.location.pathname) {
    console.log('We have switched dashboards');
    pathName = window.location.pathname;
    divPanelState = { ...defaultDivPanelState };
  }
  return divPanelState;
};

export const clearDivPanelState = () => {
  divPanelState = {
    ...divPanelState,
    command: '',
  };
};
