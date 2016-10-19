# mode-mapping

Tools to add maps to your Mode dashboards.

### Context
In the Mode editor, go to 'Report Builder', then to 'Edit HTML'. Here you can add custom HTML, CSS, and javascript to your dashboard. A global variable called ```datasets``` is available to any Javascript function, and it contains the results of all your queries. How your results are stored in this data structure is a little wonky, but the functions in this repo abstract all that away. However, be aware that if your results take up more than 15MB of space, then this object will point to a .csv file instead of as a JSON, and none of these tools will work. 

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
  * ```radius_fun``` A function controlling the radius of plotted point. It should look like ```radius_fun(content, idx)```, where content is table associated with ```query_name``` and ```idx``` is the index in ```content``` currently being plotted. Note you can call on any column in ```content``` to determine the radius. If ```null``` then the radius is 2px.
  * ```color_fun``` A function controlling the color of plotted point. It should look like ```color_fun(content, idx)```, where content is table associated with ```query_name``` and ```idx``` is the index in ```content``` currently being plotted. Note you can call on any column in ```content``` to determine the color. If ```null``` then the color is red.

####Example:
```
<div id="test-pts" class="map">
  <script>
    modemap.plot.pts("test-pts", [37.7764386, -122.3947219], 10, "Query 1", "passenger_lat", "passenger_lng", null, null) 
  </script>
</div>
```

For plotting geohashes, use ```modemap.plot.ghs(map_id, center, default_zoom, query_name, gh_col, val_col, color_fun)```:

The (new) inputs are
  * ```gh_col``` The name of the columns that should be used for plotting geohashes
  * ```val_col``` The value to be associated with the geohash (usually for coloring)
  * ```color_fun``` A function controlling the color of plotted point. It should look like ```color_fun(content, idx)```, where content is table associated with ```query_name``` and ```idx``` is the index in ```content``` currently being plotted. Note you can call on any column in ```content``` to determine the color. If ```null``` then the color is red.

```
<div id="test-ghs" class="map">
  <script>
    var cf = modemap.color.fun.jet("num_requests", 1000, 100000)
    modemap.plot.ghs("test-ghs", [37.7764386,   -122.3947219], 10, "Query 2", "gh6", "num_requests", cf) 
  </script>
</div>
```

### Notes:
You can't CDN out of a private repo (like Lyft's) so this comes out of my personal github account. There is nothing Lyft specific in this code. 
