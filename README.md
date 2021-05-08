# Grafana DIV Panel

![](https://raw.githubusercontent.com/srclosson/grafana-div-panel/master/src/img/screenshot1.png)
![](https://raw.githubusercontent.com/srclosson/grafana-div-panel/master/src/img/echarts-gl-gps.png)

The div panel is a generic panel allowing you to specify your own html and javascript
Just write your html the same way you normally would:

```
<html>
  <head>
    <!-- Add anything so it's available when your body script is run
    <link href="to/some.css" >
    <script src="to/some.js" /></script>
    -->
  </head>
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

Alternatively, you can use `script` tags and specify a `run` type. The same script above then would be:
```
<html>
  <head>
    <!-- Add anything so it's available when your body script is run
    <link href="to/some.css" >
    <script src="to/some.js" /></script>
    -->
  </head>
  <body>
    <div>
        Hello Div Panel
    </div>

    <script run="oninit">
      console.log("I am in init", elem);
    </script>

    <sceript run="onentereditmode">
      console.log("I entered edit mode", elem, content);
    </script>

    <script run="onexiteditmode">
      console.log("I exited edit mode", elem);
      let html = '<p>Hello</p>';
      return html;
    <script>
      
    <script> run="ondata">
      console.log("I have data", data);
    </script>
    
    <script>
      console.log("You will see this on all updates");
    </script>
  </body>
</html>
```

It differs from other "DIY" panels in that it tries to allow as close as possible, the ability to load and use javascript
libraries exactly as you would if you were developing an html page without grafana. Just open the embedded code editor (monaco)
and write your code.

## Features
1. Builtin monaco code editor
2. Support for handlebars templates. If you log your data from the `onDivPanelDataUpdate` callback, you can use handlebars addressing to reference the data. Your templates will be resolved when the panel renders.
3. Support for script type="module".

## Development workflow
1. Write the code in the code editor.
2. Hit `run` to run a data update
3. Hit `clear` to clear the the rendered HTML+Javascript. When you hit run the next time, you will also get your `onDivPanelInit` callback.
*Important* You must hit `<CTRL+S>` in the editor to save. When saving, your control will be re-rendered.

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


