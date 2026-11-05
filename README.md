# Grafana DIV Panel

![](https://raw.githubusercontent.com/srclosson/grafana-div-panel/master/src/img/screenshot1.png)
![](https://raw.githubusercontent.com/srclosson/grafana-div-panel/master/src/img/echarts-gl-gps.png)

The div panel is a generic panel allowing you to specify your own html and javascript.
Just write your html the same way you normally would:

```html
<html>
  <head>
    <!-- Add anything so it's available when your body script is run
    <link href="to/some.css" rel="stylesheet">
    <script src="to/some.js"></script>
    -->
  </head>
  <body>
    <div>
        Hello Div Panel
    </div>

    <script>
        /**
         * Runs once, after the document and its scripts have loaded.
         * @param elem The <body> of the panel's document
         * @param content What onDivPanelExitEditMode returned last time ('' if never edited)
         */
        function onDivPanelInit(elem, content) {
          console.log("I am in init", elem, content);
        }

        /**
         * Runs when the panel starts edit mode (see "Editing inside the panel").
         * @param elem The <body> of the panel's document
         * @param content What onDivPanelExitEditMode returned last time
         */
        function onDivPanelEnterEditMode(elem, content) {
          console.log("I entered edit mode", elem, content);
        }

        /**
         * @param elem The <body> of the panel's document
         * @returns The html content to save and hand back to onDivPanelEnterEditMode
         */
        function onDivPanelExitEditMode(elem) {
          console.log("I exited edit mode", elem);
          return '<p>Hello</p>';
        }

        /**
         * Runs every time the panel's query returns data.
         * @param data The panel's data frames
         * @param elem The <body> of the panel's document
         */
        function onDivPanelDataUpdate(data, elem) {
          console.log("I have data", data);
        }

        console.log("This runs once, when the document loads");
    </script>
  </body>
</html>
```

Alternatively, you can use `script` tags with a `run` attribute. Each one becomes the body of the matching callback,
so this is the same as the script above:

```html
<html>
  <body>
    <div>
        Hello Div Panel
    </div>

    <script run="oninit">
      console.log("I am in init", elem, content);
    </script>

    <script run="onentereditmode">
      console.log("I entered edit mode", elem, content);
    </script>

    <script run="onexiteditmode">
      console.log("I exited edit mode", elem);
      return '<p>Hello</p>';
    </script>

    <script run="ondata">
      console.log("I have data", data);
    </script>
  </body>
</html>
```

It differs from other "DIY" panels in that it tries to allow as close as possible, the ability to load and use javascript
libraries exactly as you would if you were developing an html page without grafana. Just open the embedded code editor (monaco)
and write your code.

## How it runs: a sandboxed iframe

Each panel's document runs in its own `<iframe sandbox="allow-scripts">`. Because the frame is not given
`allow-same-origin`, it gets an opaque (`null`) origin. Your code:

- **can** load scripts, styles, fonts and images from other sites, use `type="module"` and import maps, draw to canvas and
  WebGL, and `fetch` from any server that allows cross-origin requests (`Access-Control-Allow-Origin: *`).
- **cannot** read or change the Grafana page, read Grafana's cookies or local storage, or call Grafana's API as the
  person viewing the dashboard. It also can't open popups, submit forms, show `alert()` dialogs or navigate the dashboard away.

That means a dashboard editor can't use a div panel to act as whoever views the dashboard. You don't need to change
`allow_embedding`: the panel builds the document itself (`srcdoc`), so Grafana's `X-Frame-Options` never applies to it.

Things to know:

- Each panel is isolated. `window`, globals and `divGlobals` are per panel, so two div panels on one dashboard can't collide.
- Your document loads once. Data updates arrive as `onDivPanelDataUpdate` calls; top-level code doesn't re-run.
- Data arrives as plain objects: `{ name, refId, meta, length, fields: [{ name, type, config, labels, values }] }`.
  Grafana's helper functions (such as `field.display`) don't cross into the frame.
- Script errors, including uncaught exceptions and rejected promises, are shown at the bottom of the panel.
- The panel follows Grafana's light/dark theme and font.
- If you've turned on Grafana's `content_security_policy`, the frame inherits that policy, and Grafana's default template
  blocks the inline scripts the panel needs. Leave it off or adjust the template to use this panel.

## Features
1. Builtin monaco code editor
2. Support for handlebars templates in your markup, with the panel's data frames as context: `{{0.name}}` is the first
   frame's name and `{{last}}` is the latest value of the first frame's second field. Templates are not applied inside
   `<script>` tags. When the rendered markup changes, the panel's document reloads (and `onDivPanelInit` runs again), so
   prefer `onDivPanelDataUpdate` for values that change every refresh.
3. Support for script type="module". `divPanelContainer` is available to modules and is the document's `<body>`.
   Modules run before init, so to use the saved edit content, listen for the `divpanelinit` event:
   `addEventListener('divpanelinit', (e) => render(e.detail.content))`.

## Development workflow
1. Write the code in the code editor, or pick one from **Start from an example…** above it. If you've changed the
   code, you're asked before it's replaced.
2. Hit `Run`, press `<CTRL+S>`, or click outside the editor to apply your changes. The panel reloads with the new document.

## Editing inside the panel
Edit mode lets someone change what the panel shows (with a WYSIWYG or drag-and-drop editor you build, for example)
without touching your code. Your code stays as it is in the code editor; the result of their edits is saved
separately with the panel, and every time the panel loads it's handed to `onDivPanelInit(elem, content)`, where
your code renders it.

If your document defines both `onDivPanelEnterEditMode` and `onDivPanelExitEditMode`, opening the panel's editor
calls `onDivPanelEnterEditMode(elem, content)` and shows a toolbar above the panel:

- **Save edits** calls `onDivPanelExitEditMode(elem)` and saves the string it returns with the panel.
- **Edit** calls `onDivPanelEnterEditMode(elem, content)` again with the saved content.

Click **Save edits** before leaving the panel editor. The panel also tries to save when you leave, but the frame
answers asynchronously, so Grafana may close the panel first. Remember to save the dashboard too: the edits are
stored in its JSON. See `examples/ckeditor.html`.

The saved content is also available to any script as `divPanelEditContent`, once init has run.

## Callbacks
There are four callbacks provided. In all of them `elem` is the `<body>` of the panel's document.
1. `onDivPanelInit(elem, content)`: Called once, after your html and its scripts have loaded, with the saved edit content.
2. `onDivPanelDataUpdate(data, elem)`: Called with the data retrieved from the datasource, on every update.
3. `onDivPanelEnterEditMode(elem, content)`: Called when edit mode starts.
4. `onDivPanelExitEditMode(elem)`: Called on **Save edits**. Return the html to save.

## Upgrading from 1.x
- Panels now run in a sandboxed iframe (see above). Code that reached into the Grafana page, its cookies or its API will stop working.
- `elem` is now the document's `<body>` in every callback. Previously `onDivPanelInit` received the first element and
  `onDivPanelDataUpdate` the wrapper. Use `document.getElementById(...)` to find your elements.
- `divPanelElementUUID` is gone; use `divPanelContainer` or `document.body`.
- The `Clear` button is gone. `Run` applies what's in the editor, even if you haven't pressed `<CTRL+S>`.

## Building
To build:
1. Clone this repo
2. `yarn install`
3. `yarn dev` (for a dev build) or `yarn build` (for a prod build that is minified)
4. Restart grafana

## Examples
The examples in the `examples/` folder are built into the plugin and listed in the editor's **Start from an example…**
picker. To add one, put the `.html` file in `examples/` and add it to `src/examples.ts`.
