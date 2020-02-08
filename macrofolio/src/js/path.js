import * as d3 from 'd3'
import { geoPath } from 'd3-geo'

export function gen_path(source, target){
     let path_obj =
     {
       "type": "Feature",
       "geometry": {
          "type": "LineString",
          "coordinates": [
              source,
              target
          ]
       }
     }
     return path_obj
}

export function draw_path(svg, policy, path_obj){
    svg.append("path")
        .datum(path_obj)
        .attr("class", "twopath")
        .attr("fill-opacity", "0")
        .attr("stroke-opacity", "1")
        .attr("stroke-width", "1")
        .attr("stroke", "#888888")
        .attr("d", d3.geoPath(policy.projection));
}
