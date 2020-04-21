# Grafana DIV Panel

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

        function onDivPanelDataUpdate(data) {
            console.log("I have data", data);
        }
        
        console.log("from script");
    </script>
  </body>
</html>
```

There are two callbacks provided. The first is only called on init `onDivPanelInit`
The second is onDivPanelDataUpdate, and it is called with the data retrieved from the datasource and is called `onDivPanelDataUpdate`.

Examples coming soon. Please share your creations!