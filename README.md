# Grafana DIV Panel

![](https://raw.githubusercontent.com/srclosson/grafana-div-panel/master/src/img/screenshot1.png)

The div panel is a generic panel allowing you to specify your own html and javascript
Just write your html the same way you normally would:

```
<html>
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
</html>
```

## Callbacks
There are four callbacks provided. 
1. `onDivPanelInit`: Called when your panel is contructed and your html is available.
2. `onDivPanelDataUpdate`: Called with the data retrieved from the datasource.
3. `onDivPanelEnterEditMode`: Called whenever you enter edit mode.
4. `onDivPanelExitEditMode`: Called whenever you exit edit mode.

## Building
To build:
1. Clone this repo
2. `yarn install`
3. `yarn dev` (for a dev build) or `yarn build` (for a prod build that is minified)
4. Restart grafana

## Examples
See the examples in the examples folder