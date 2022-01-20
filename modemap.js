var modemap = function() {

      var jet_colors = (function() {
          
          var componentToHex = function(c) {
              var hex = c.toString(16);
              return hex.length == 1 ? "0" + hex : hex;
          };

          var rgbToHex = function(r, g, b) {
              return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
          };
          
          var colors = {
              r: new Uint8Array(256),
              g: new Uint8Array(256),
              b: new Uint8Array(256),
              hex: []
          }

          var r, g, b;
          for (var i=0; i<256; i++) {

              r = Math.min(255, 4*(i-96), 255 - 4*(i-224));
              r = r < 0 ? 0 : r;

              g = Math.min(255, 4*(i-32), 255 - 4*(i-160));
              g = g < 0 ? 0 : g;

              b = Math.min(255, 4*i + 127, 255 - 4*(i-96));
              b = b < 0 ? 0 : b;

              colors.r[i] = r;
              colors.g[i] = g;
              colors.b[i] = b;
              colors.hex.push(rgbToHex(r,g,b));
          }

          colors.index = function(min, max, value) {
              if (value > max) return 255;
              else if (value < min) return 0;
              else return Math.floor(256*(value - min)/(max-min));
          }

          return colors 

      })()

      var jet_colorbar = function(map_id, min, max) {
            
        $('#' + map_id).after('<div class="colorbar-container"><div class="colorbar-ticks"></div><div class="colorbar"></div></div>')
        
        var $colorbar = $('#' + map_id).siblings('.colorbar-container').children('.colorbar')
        
        for (var i=0; i<256; i++) {
        
          var stripe_color_index = jet_colors.index(
            min,
            max, 
            min + (max - min) * (i / 256)
          )
          
          var stripe_color = jet_colors.hex[stripe_color_index]
          
          $colorbar.append('<div class="colorbar-stripe" style="background-color:' + stripe_color + '"></div>')
          
        }
      
      var $colorbar_ticks = $('#' + map_id).siblings('.colorbar-container').children('.colorbar-ticks')
      
      $colorbar_ticks.append('<div class="colorbar-tick colorbar-tick-left">' + String(min) + '</div>')
      $colorbar_ticks.append('<div class="colorbar-tick colorbar-tick-middle">' + String((min + max) / 2) + '</div>')
      $colorbar_ticks.append('<div class="colorbar-tick colorbar-tick-right">' + String(max) + '</div>')
        
      }
          


    var color = {
        pallettes: {
            "lyft": {
                "pink": "#ff00bf",
                "mulberry": "#352384",
                "bone": "#F3F3F5",
                "charcoal": "#333447",
                "stone": "#bfc7d9"
            },
            "lyft-deprecated": {
                "pink": "#ea0b8c",
                "dk-pink": "#ae005e",
                "orange": "#faa33h",
                "yellow": "#fc3322",
                "green": "#33d9c2",
                "blue": "#2aace3"
            }
        },
        fun: {
            constant: function(color) {
                return function(content, index) {
                    return color
                }
            },
            jet: function(val_col, min_sat, max_sat) {
                
                /*
                var componentToHex = function(c) {
                    var hex = c.toString(16);
                    return hex.length == 1 ? "0" + hex : hex;
                };

                var rgbToHex = function(r, g, b) {
                    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
                };

                var colors = {
                    r: new Uint8Array(256),
                    g: new Uint8Array(256),
                    b: new Uint8Array(256),
                    hex: []
                }

                var r, g, b;
                for (var i=0; i<256; i++) {

                    r = Math.min(255, 4*(i-96), 255 - 4*(i-224));
                    r = r < 0 ? 0 : r;

                    g = Math.min(255, 4*(i-32), 255 - 4*(i-160));
                    g = g < 0 ? 0 : g;

                    b = Math.min(255, 4*i + 127, 255 - 4*(i-96));
                    b = b < 0 ? 0 : b;

                    colors.r[i] = r;
                    colors.g[i] = g;
                    colors.b[i] = b;
                    colors.hex.push(rgbToHex(r,g,b));
                }

                colors.index = function(min, max, value) {
                    if (value > max) return 255;
                    else if (value < min) return 0;
                    else return Math.floor(256*(value - min)/(max-min));
                }
                */



                return function(content, idx) {
                    return jet_colors.hex[jet_colors.index(min_sat, max_sat, content[idx][val_col])]
                }
            }
        }, 
        utils: {
            jet_colors: jet_colors, 
            jet_colorbar: jet_colorbar
        }
    }

    var mapping = {
        init: function(map_id, center, default_zoom) {
            var map = L.map(map_id).setView(center, default_zoom)
            /** with available mapbox auth tocken
            L.tileLayer(
                'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw',
                {
                    maxZoom: 18,
                    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                    id: 'mapbox.streets'
                }
            ).addTo(map)
            **/
            
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map)

            return map
        }
    }

    var geohash = function() {
        // geohash.js
        // Geohash library for Javascript
        // (c) 2008 David Troy
        // Distributed under the MIT License
        // Modified from https://github.com/davetroy/geohash-js/commit/463cb69f97115bb104e9f4137215c8e3503a5e40

        var BITS        = [16, 8, 4, 2, 1],
            BASE32      = "0123456789bcdefghjkmnpqrstuvwxyz",
            NEIGHBORS   = { right  : { even :  "bc01fg45238967deuvhjyznpkmstqrwx" },
                            left   : { even :  "238967debc01fg45kmstqrwxuvhjyznp" },
                            top    : { even :  "p0r21436x8zb9dcf5h7kjnmqesgutwvy" },
                            bottom : { even :  "14365h7k9dcfesgujnmqp0r2twvyx8zb" }
                        },
            BORDERS     = { right  : { even : "bcfguvyz" },
                            left   : { even : "0145hjnp" },
                            top    : { even : "prxz" },
                            bottom : { even : "028b" }
                        }

        NEIGHBORS.bottom.odd = NEIGHBORS.left.even;
        NEIGHBORS.top.odd = NEIGHBORS.right.even;
        NEIGHBORS.left.odd = NEIGHBORS.bottom.even;
        NEIGHBORS.right.odd = NEIGHBORS.top.even;

        BORDERS.bottom.odd = BORDERS.left.even;
        BORDERS.top.odd = BORDERS.right.even;
        BORDERS.left.odd = BORDERS.bottom.even;
        BORDERS.right.odd = BORDERS.top.even;

        var refine_interval = function(interval, cd, mask) {
            if (cd & mask)
                interval[0] = (interval[0] + interval[1])/2;
            else
                interval[1] = (interval[0] + interval[1])/2;
        }

        var decode = function(geohash) {
            var is_even = 1;
            var lat = []; var lon = [];
            lat[0] = -90.0;  lat[1] = 90.0;
            lon[0] = -180.0; lon[1] = 180.0;
            lat_err = 90.0;  lon_err = 180.0;

            for (i=0; i<geohash.length; i++) {
                c = geohash[i];
                cd = BASE32.indexOf(c);
                for (j=0; j<5; j++) {
                    mask = BITS[j];
                    if (is_even) {
                        lon_err /= 2;
                        refine_interval(lon, cd, mask);
                    } else {
                        lat_err /= 2;
                        refine_interval(lat, cd, mask);
                    }
                    is_even = !is_even;
                }
            }
            lat[2] = (lat[0] + lat[1])/2;
            lon[2] = (lon[0] + lon[1])/2;

            return { lat: lat[2], lng: lon[2], corners: [[lat[1], lon[0]], [lat[0], lon[1]]]};
        }

        var encode = function(latitude, longitude) {
            var is_even=1;
            var i=0;
            var lat = []; var lon = [];
            var bit=0;
            var ch=0;
            var precision = 12;
            geohash = "";

            lat[0] = -90.0;  lat[1] = 90.0;
            lon[0] = -180.0; lon[1] = 180.0;

            while (geohash.length < precision) {
              if (is_even) {
                    mid = (lon[0] + lon[1]) / 2;
                if (longitude > mid) {
                        ch |= BITS[bit];
                        lon[0] = mid;
                } else
                        lon[1] = mid;
              } else {
                    mid = (lat[0] + lat[1]) / 2;
                if (latitude > mid) {
                        ch |= BITS[bit];
                        lat[0] = mid;
                } else
                        lat[1] = mid;
              }

                is_even = !is_even;
              if (bit < 4)
                    bit++;
              else {
                    geohash += BASE32[ch];
                    bit = 0;
                    ch = 0;
              }
            }
            return geohash;
        }

        return {
            decode: decode,
            encode: encode
        }

    }()

    var mode = {
        get_query_content: function(query_name) {
            return datasets.filter(function(d) { return d.queryName == query_name; })[0].content
        }
    }

    var plot = {

        any: function(map, content, row_fun) {

            for (var i=0; i<content.length; i++) {
                row_fun(map, content, i)
            }

            return map 
        },

        pts: function(map_id, center, default_zoom, query_name, lat_col, lng_col, radius_fun, color_fun) {

            var content = mode.get_query_content(query_name)

            var map = mapping.init(map_id, center, default_zoom)

            for (var i=0; i<content.length; i++) {
                L.circleMarker(
                    [content[i][lat_col], content[i][lng_col]],
                    {
                        radius: radius_fun ? radius_fun(content, i) : 2,
                        weight: 1,
                        color: "#000000",
                        opacity: 1,
                        fillOpacity: 0.5,
                        fillColor: color_fun ? color_fun(content, i) : "#FF0000"
                    }
                ).addTo(map)
            }

            return map
        },

        ghs: function(map_id, center, default_zoom, query_name, gh_col, val_col, color_fun, opacity) {

            var content = mode.get_query_content(query_name)

            var map = mapping.init(map_id, center, default_zoom)

            for (var i=0; i<content.length; i++) {
                var gh = L.rectangle(
                    geohash.decode(content[i][gh_col]).corners,
                    {
                        weight: 0,
                        color: "#000000",
                        fillOpacity: opacity || 0.5,
                        fillColor: color_fun ? color_fun(content, i) : "#FF0000"
                    }
                )
                
                gh.bindPopup(content[i][gh_col] + ': ' + String(content[i][val_col]))
                
                gh.addTo(map)
            }

            return map
        },

        ghs_w_wkhr_slider: function(map_id, center, default_zoom, query_name, gh_col, val_col, wkhr_col, color_fun, opacity) {

            var content = mode.get_query_content(query_name)

            var map = mapping.init(map_id, center, default_zoom)

            $("#" + map_id).after("<div class='wkhr-slider-container'><input id='" + map_id + "-wkhr-slider' class='wkhr-slider' type='range' min='0' max='167' step='0' value='0'><div id='" + map_id + "-wkhr-display' class='wkhr-display'>0</div><div id='" + map_id + "-val-display' class='val-display'>0</div>")

            var layers = []

            var plot_wkhr = function(wkhr) {

                for (var i=0; i<layers.length; i++) {
                    map.removeLayer(layers[i])
                }

                layers = []

                for (var i=0; i<content.length; i++) {
                    if (content[i][wkhr_col] == wkhr) {
                        var layer = L.rectangle(
                            geohash.decode(content[i][gh_col]).corners,
                            {
                                weight: 0,
                                color: "#000000",
                                fillOpacity: opacity || 0.5,
                                fillColor: color_fun ? color_fun(content, i) : "#FF0000"
                            }
                        )

                        layer.gh = content[i][gh_col]
                        layer.gh_val = content[i][val_col]

                        layer.on("mouseover", function(e) {
                            $("#" + map_id + "-val-display").text(this.gh + ": " + this.gh_val)
                        })

                        layer.addTo(map)

                        layers.push(layer)
                    }
                }
            }

            var day_to_name = {
                0: "Monday",
                1: "Tuesday",
                2: "Wednesday",
                3: "Thursday",
                4: "Friday",
                5: "Saturday",
                6: "Sunday"
            }

            var daylight_to_name = {
                0: "am",
                1: "pm"
            }

            $("#" + map_id + "-wkhr-slider").change(function() {
                var wkhr = $(this).val()
                plot_wkhr(wkhr)

                var dayhr = (wkhr % 24) % 12
                dayhr = dayhr ? dayhr : 12

                var daylight_name = daylight_to_name[Math.floor((wkhr % 24) / 12)]
                var day_name = day_to_name[Math.floor(wkhr / 24)]

                $("#" + map_id + "-wkhr-display").text(day_name + ", " + String(dayhr) + daylight_name)

             }).trigger("change")

        }

    }
    
    var region = {
      "Atlanta": {
        "center": [33.8464, -84.3312],
        "default_zoom": 11
      },
      "Baltimore": {
        "center": [39.1754, -76.6549],
        "default_zoom": 11
      },
      "Boston": {
        "center": [42.2881, -71.0713],
        "default_zoom": 11
      },
      "Chicago": {
        "center": [41.8611, -87.9679],
        "default_zoom": 12
      },
      "Dallas": {
        "center": [32.908, -96.9811],
        "default_zoom": 11
      },
      "Denver": {
        "center": [39.7796, -104.941],
        "default_zoom": 11
      },
      "Las Vegas": {
        "center": [36.2251, -115.1055],
        "default_zoom": 12
      },
      "Los Angeles": {
        "center": [34.1705, -118.6802],
        "default_zoom": 10
      },
      "Miami": {
        "center": [26.0542, -80.4303
        ],
        "default_zoom": 12
      },
      "New Jersey": {
        "center": [40.073, -74.7322],
        "default_zoom": 8
      },
      "New York": {
        "center": [40.702, -73.9794],
        "default_zoom": 13
      },
      "Orange County": {
        "center": [33.7919, -117.779
        ],
        "default_zoom": 11
      },
      "Philadelphia": {
        "center": [39.9403, -75.3279],
        "default_zoom": 12
      },
      "Phoenix": {
        "center": [33.3273, -112.0712],
        "default_zoom": 11
      },
      "Portland": {
        "center": [45.5792, -122.6336],
        "default_zoom": 12
      },
      "Sacramento": {
        "center": [38.6499, -121.4081],
        "default_zoom": 10
      },
      "San Diego": {
        "center": [32.8894, -117.1234],
        "default_zoom": 11
      },
      "San Francisco": {
        "center": [37.7828, -122.1312],
        "default_zoom": 10
      },
      "Seattle": {
        "center": [47.699, -122.224],
        "default_zoom": 10
      },
      "Washington D.C.": {
        "center": [38.9176, -77.1453],
        "default_zoom": 11
      }
    }

    return {
        color: color,
        mapping: mapping,
        geohash: geohash,
        mode: mode,
        plot: plot,
        region: region
    }
}()
