import { PanelProps } from '@grafana/data';
import { v4 as uuidv4 } from 'uuid';

export const defaultContent = `<html>
  <body>
    <div>
        Hello Div Panel
    </div>

    <script>
        function onDivPanelInit() {
          console.log("I am in init");
        }

        function onDivPanelEnterEditMode(elem) {
          console.log("I entered edit mode");
        }

        function onDivPanelExitEditMode() {
          console.log("I exited edit mode");
        }

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
}

export const defaults: DivPanelOptions = {
  content: defaultContent,
  editContent: [],
};

export interface DivPanelProps extends PanelProps<DivPanelOptions> {}

export interface DivPanelState {
  id: string;
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
  id: uuidv4(),
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
  if (pathName != window.location.pathname) {
    console.log("We have switched dashboards");
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
