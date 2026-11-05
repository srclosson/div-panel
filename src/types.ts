export const defaultContent = `<html>
<body>
  <div>
      Hello Div Panel
  </div>

  <script>
      /**
       * Runs once, after the document and its scripts have loaded.
       * @param elem The <body> of the panel's sandboxed document
       */
      function onDivPanelInit(elem) {
        console.log("I am in init", elem);
      }

      /**
       * Runs whenever the panel's query returns data.
       * @param data The panel's data frames
       * @param elem The <body> of the panel's sandboxed document
       */
      function onDivPanelDataUpdate(data, elem) {
        console.log("I have data", data);
      }
  </script>
</body>
</html>`;

export interface DivPanelOptions {
  content: string;
  /** What onDivPanelExitEditMode last returned; handed back to onDivPanelEnterEditMode. */
  editContent: string;
}

export interface DivPanelType {
  editor: DivPanelOptions;
}

export const defaults: DivPanelOptions = {
  content: defaultContent,
  editContent: '',
};
