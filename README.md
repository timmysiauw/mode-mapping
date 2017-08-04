# mode-mapping

Tools to add maps to your Mode dashboards.

### Context
In the Mode editor, go to 'Report Builder', then to 'Edit HTML'. Here you can add custom HTML, CSS, and javascript to your dashboard. A global variable called ```datasets``` is available to any Javascript function, and it contains the results of all your queries. How your results are stored in this data structure is a little wonky, but the functions in this repo abstract all that away. However, be aware that if your results take up more than 15MB of space, then this object will point to a .csv file instead of as a JSON, and none of these tools will work. 

See [here](https://modeanalytics.com/lyft/reports/81a8d2d0ff81) for examples. 

### Step 1: Write a Query
Write a query that has a 'lat' and 'lng' column, or a 'geohash' and 'value' column. The columns do not have to be named these, they just have to represent the lat/lng pairs or the geohash/value pairs you want to plot. Run your queries.

### Step 2: Get Leaflet and Mode-Mapping into your Workspace
Go to 'Report Builder' --> 'Edit HTML'. At the top of the page, cut and paste the following code:

```
<link rel="stylesheet" href="https://npmcdn.com/leaflet@1.0.0-rc.3/dist/leaflet.css">
<script src="https://npmcdn.com/leaflet@1.0.0-rc.3/dist/leaflet.js"></script>
<script src="https://rawgit.com/timmysiauw/mode-mapping/master/modemap.js"></script>
<link rel="stylesheet" href="https://rawgit.com/timmysiauw/mode-mapping/master/modemap.css"></script>
```

### Step 3: Plot Stuff!

For plotting points, i.e., lat/lng pairs, use ```modemap.plot.pts(map_id, center, default_zoom, query_name, lat_col, lng_col, radius_fun, color_fun)```:

The inputs are
  * ```map_id``` is a string matching the id of the div associated with this map (see example below)
  * ```center``` the default center of the map when it is plotted
  * ```default_zoom``` the default zoom of the map when it is plotted
  * ```query_name``` the Mode query name where data should be pulled from
  * ```lat_col``` The name of the columns that should be used for plotting latitude
  * ```lng_col``` The name of the columns that should be used for plotting longitude
  * ```radius_fun``` A function controlling the radius of plotted point. It should look like ```radius_fun(content, idx)```, where content is the table associated with ```query_name``` and ```idx``` is the index in ```content``` currently being plotted. Note you can call on any column in ```content``` to determine the radius. If ```radius_fun = null``` then the radius is 2px.
  * ```color_fun``` A function controlling the color of plotted point. It should look like ```color_fun(content, idx)```, where content is the table associated with ```query_name``` and ```idx``` is the index in ```content``` currently being plotted. Note you can call on any column in ```content``` to determine the color. If ```color_fun = null``` then the color is red.

#### Example:
```
<div id="test-pts" class="map">
  <script>
    modemap.plot.pts("test-pts", [37.7764386, -122.3947219], 10, "Query 1", "passenger_lat", "passenger_lng", null, null) 
  </script>
</div>
```

For plotting geohashes, use ```modemap.plot.ghs(map_id, center, default_zoom, query_name, gh_col, val_col, color_fun)```:

The (new) inputs are
  * ```gh_col``` The name of the column that should be used for plotting geohashes
  * ```val_col``` The value to be associated with the geohash (usually for coloring)
  * ```color_fun``` A function controlling the color of plotted point. It should look like ```color_fun(content, idx)```, where content is table associated with ```query_name``` and ```idx``` is the index in ```content``` currently being plotted. Note you can call on any column in ```content``` to determine the color. If ```null``` then the color is red.

#### Example:
```
<div id="test-ghs-2" class="map">
  <script>
    modemap.plot.ghs("test-ghs-2", [37.7764386, -122.3947219], 10, "Query 2", "gh6", "num_requests", cf) 
  </script>
</div>
```

For plotting geohashes with a week hour slider, use ```modemap.plot.ghs_w_wkhr_slider(map_id, center, default_zoom, query_name, gh_col, val_col, wkhr_col, color_fun)```:

The (new) input are
 * ```wkhr_col``` The name of the column that should be used for the week hour. 
 
#### Example:
```
<div id="test-ghs-3" class="map">
  <script>
    var cf = modemap.color.fun.jet("req_cnt", 1, 20)
    modemap.plot.ghs_w_wkhr_slider("test-ghs-3", [37.7764386, -122.3947219], 10, "Query 3", "gh6", "req_cnt", "wkhr", cf)
</script>
```

###Geohashes:
You can use ```LEFT(f_geohash_encode(lat, lng), 6) AS gh6``` in SQL to get a column of geohash 6's from columns ```lat``` and ```lng```. 

You can use ```modemap.geohash.encode(lat, lng)``` and ```modemap.geohash.decode(gh)``` in Javascript to encode and decode geohashes. The ```decode``` function returns an object with properties ```lat```, ```lng```, and ```corners```. Here ```corners``` is the top-left and bottom-right corners of the geohash in the form required by Leaflet to make [rectangles](http://leafletjs.com/reference-1.0.0.html#rectangle). 

### Color and Radius Functions
Color and radius functions let you size/color points or color geohashes dynamically based on your SQL results. 

#### Example:
```
<div id="test-pts-2" class="map">
  <script>
    var rf = function(content, idx) {
      if (content[idx]["passenger_lng"] < -122.3547) {
        return 4
      }
      else {
        return 2
      }
    }
    var cf = function(content, idx) {
      if (content[idx]["passenger_lng"] < -122.3547) {
        return "#FF0000"
      }
      else {
        return "#0000FF"
      }
    }
    modemap.plot.pts("test-pts-2", [37.7764386,   -122.3947219], 10, "Query 1", "passenger_lat", "passenger_lng", rf, cf) 
  </script>
</div>
```

### Built-in Color Functions
There are a few color function generators already built in to ```modemap```. More to come!

1. ```modemap.color.fun.constant(color)```: takes a color (hex string) and returns a function that will return that color for all plot markers. 
2. ```modemap.color.fun.jet(val_col, min_val, max_val)```: takes the name of a value column in your query results, ```val_col``` and returns a function that will return a color according to [JET](http://matlab.izmiran.ru/help/techdoc/ref/colormap.html) linear color scheme. Values less than ```min_val``` will be assigned the lowest color value (blue) and values higher than ```max_val``` will be assigned the highest color value (red). 

### Region Center and Default Zoom
You can access `modemap.region` to get region centers and default zooms. To avoid using Lyft-specific region codes, city names are used instead. For example, `modemap.region['San Francisco'].center = [37.7764386,   -122.3947219]`. You can use this information as input to the modemap plotting tools instead of looking them up elsewhere. 

### Color Pallettes
You can access some color pallettes using ```modemap.color.palletes```

### Troubleshooting
You cannot have an unrun query in your list of queries. The map will not show up. 

### Notes:
You can't CDN out of a private repo (like Lyft's) so this comes out of my personal github account. There is nothing Lyft specific in this code. 
