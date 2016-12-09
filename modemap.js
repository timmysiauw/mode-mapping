var modemap = function() {

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

                return function(content, idx) {
                    return colors.hex[colors.index(min_sat, max_sat, content[idx][val_col])]
                }
            }
        }
    }

    var mapping = {
        init: function(map_id, center, default_zoom) {
            var map = L.map(map_id).setView(center, default_zoom)
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

        ghs: function(map_id, center, default_zoom, query_name, gh_col, val_col, color_fun) {

            var content = mode.get_query_content(query_name)

            var map = mapping.init(map_id, center, default_zoom)

            for (var i=0; i<content.length; i++) {
                L.rectangle(
                    geohash.decode(content[i][gh_col]).corners,
                    {
                        weight: 0,
                        color: "#000000",
                        fillOpacity: 0.5,
                        fillColor: color_fun ? color_fun(content, i) : "#FF0000"
                    }
                ).addTo(map)
            }

            return map
        },

        ghs_w_wkhr_slider: function(map_id, center, default_zoom, query_name, gh_col, val_col, wkhr_col, color_fun) {

            var content = mode.get_query_content(query_name)

            var map = mapping.init(map_id, center, default_zoom)

            $("#" + map_id).after("<input id='" + map_id + "-wkhr-slider' class='wkhr-slider' type='range' min='0' max='167' step='0' value='0'>")

            var plot_wkhr = function(wkhr) {

                console.log(wkhr)
                console.log(map)
                /*
                map.eachLayer(function (layer) {
                    console.log("removing a layer!")
                    map.removeLayer(layer);
                });
                */

                for (var i=0; i<content.length; i++) {
                    if (content[i][wkhr_col] == wkhr) {
                        L.rectangle(
                            geohash.decode(content[i][gh_col]).corners,
                            {
                                weight: 0,
                                color: "#000000",
                                fillOpacity: 0.5,
                                fillColor: color_fun ? color_fun(content, i) : "#FF0000"
                            }
                        ).addTo(map)
                    }
                }
            }

            $("#" + map_id + "-wkhr-slider").change(function() {
                plot_wkhr($(this).val())
             })

            plot_wkhr(0)
        }

    }

    return {
        color: color,
        mapping: mapping,
        geohash: geohash,
        mode: mode,
        plot: plot
    }
}()
