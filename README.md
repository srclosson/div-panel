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
        function onDivPanelInit() {
          console.log("I am in init");
        }

        function onDivPanelEnterEditMode() {
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
</html>
```

There are four callbacks provided. 
1. `onDivPanelInit`: Called when your panel is contructed and you html is available.
2. `onDivPanelDataUpdate`: Called with the data retrieved from the datasource.
3. `onDivPanelEnterEditMode`: Called whenever you enter edit mode.
4. `onDivPanelExitEditMode`: Called whenever you exit edit mode.
