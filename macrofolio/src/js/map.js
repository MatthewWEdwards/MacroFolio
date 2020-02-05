import * as d3 from 'd3'
import { geoPath } from 'd3-geo'
import world_countries from './world-countries.json'
import { Point, GeoPoint, CartesianPoint } from './point.js'
import { map_style } from './styling.js'

// Nice styling for maps: https://www.colourlovers.com/palette/2590280/Old_Style_Map
// d3 map filters: http://geoexamples.blogspot.com/2014/01/d3-map-styling-tutorial-ii-giving-style.html

// Circle vars TODO: Manage these better
var circles = {}
var circle_cnt = 0
var target

export class RenderPolicy{
    constructor(center=true, 
                scale=true, 
                debug=false, 
                padding=25, 
                projection="geoEqualEarth",
                color="#000000",
                circle_radius=1,
                width=675)
   {
       this.aspect_ratio = 2.25
       this.viewbox_ratio = 1.5

       this.center = center
       this.scale = scale
       this.debug = debug
       this.padding = padding
       this.projection_option = projection
       this.projection = get_projection(projection)
       this.circle_color = color
       this.circle_radius = circle_radius
       this.circle_generator = d3.geoCircle()
       this.circle_generator.radius(circle_radius)
       this.width = width
       this.height = width/this.aspect_ratio
    }

    reset_projection(){
       this.projection = get_projection(this.projection_option)
    }
}

function get_projection(projection){
    if(projection == "geoEqualEarth"){
        return d3.geoEqualEarth()
    }
    else if(false){
        // More projections...
    }
    else{
        return d3.geoEqualEarth() // Default
    }
}

// SVG utils
export function setup_svg(id, policy){
    let old = d3.selectAll('svg')
    if(!(old === undefined))
        old.remove()

    var svg = d3.select(id).append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (policy.width * policy.viewbox_ratio) + " " + (policy.height * policy.viewbox_ratio))
        .classed("svg-content", true);
    return svg
}

// Circle funcs
export function add_circle(svg, policy, color=undefined, center=[0,0]){
    let projection = policy.projection
    let circleGenerator = policy.circle_generator

    if(color === undefined){
        color = policy.circle_color
    }

    circleGenerator.center(center)
    let circle_id = "circle_" + circle_cnt
    circle_cnt += 1
    svg.append("path")
        .datum(circleGenerator())
        .attr("fill", color)
        .style("filter", "url(#point-style)")
        .attr("id", circle_id)
        .attr("d", d3.geoPath(projection));
    circle_id = "#" + circle_id
    circles[circle_id] = center
    return circle_id
}

export function map_range(svg, extent, geos, policy){
    if(policy == undefined || typeof policy != typeof new RenderPolicy()){
        policy = new RenderPolicy()
    }

    policy.reset_projection()
    let projection = policy.projection

    let pad = policy.padding

    // Center
    var center = Point.center(extent[0], extent[1])
    if(policy.center)
        projection.center(center)
    
    // Get extreme top-left and bottom-right points
    let extent_geo = extent.map(point => projection(point.point))
    let clip, top_left, bot_right

    let scale = projection.scale()/100
    let cut_width = policy.width*scale
    let cut_height = policy.height*scale

    if(policy.center){
        let clip_width  = Math.abs(extent_geo[0][0] - extent_geo[1][0])/2 + pad
        let clip_height = Math.abs(extent_geo[0][1] - extent_geo[1][1])/2 + pad

        let center_xy = projection(center)
        let cx = center_xy[0]
        let cy = center_xy[1]

        top_left  = [Math.max(0, cx - clip_width), Math.max(0, cy - clip_height)]
        bot_right = [Math.min(cut_width, cx + clip_width), Math.min(cut_height, cy + clip_height)]
        clip = [top_left, bot_right]

    }else{
        let carts = Array()
        geos.forEach((geo)=>{carts.push(geo.toCartesian(projection))})
        let extremes = Point.range(carts)
        top_left = extremes[0].point
        bot_right = extremes[1].point

        top_left[0] = Math.max(0, top_left[0] - pad)
        top_left[1] = Math.max(0, top_left[1] - pad)
        bot_right[0] = Math.min(cut_width, bot_right[0] + pad)
        bot_right[1] = Math.min(cut_height, bot_right[1] + pad)
        clip = [top_left, bot_right]
    }

    // Scale
    let new_scale
    if(policy.scale){
        let new_width  = (bot_right[0] - top_left[0])
        let new_height = (bot_right[1] - top_left[1])
        let dialation_x = new_width/cut_width
        let dialation_y = new_height/cut_height
        new_scale = Math.min(dialation_x, dialation_y)

        top_left[0] = top_left[0] - top_left[0]/(new_scale)
        top_left[1] = top_left[1] - top_left[1]/(new_scale)
        bot_right[0] = bot_right[0]/new_scale
        bot_right[1] = bot_right[1]/new_scale
        projection.scale(100/new_scale)
    }

    // Debug
    if(policy.debug){
        add_circle(svg, policy, "#00ff00", projection.invert(top_left))
        add_circle(svg, policy, "#0000ff", projection.invert(bot_right))
    }

    // Add style
    map_style(svg)

    // Draw map
    svg.append("path")
        .datum(world_countries)
        .attr("fill","#D1BEB0")
        .style("filter", "url(#geo-style)")
        .style("stroke", "#999")
        .style("stroke-width", 0.2)
        .attr("d", d3.geoPath(projection))
  
    // Init dynamic map
    init_dynamic_map(svg, policy)

    return projection
}

function init_dynamic_map(svg, policy){
    d3.select("svg").on("mousedown.log", function() {
      let target_loc = new GeoPoint(policy.projection.invert(d3.mouse(this)))
      set_target_loc(svg, policy, target_loc.point)
    });
}

function set_target_loc(svg, policy, loc){
    remove_target(svg)
    target = add_circle(svg, policy, "#999999", loc)
    for(const circle_id in circles){
        let path_obj = gen_path(circles[circle_id], loc)
        draw_path(svg, policy, path_obj)
    }
}

function remove_target(svg){
    d3.select(target).remove()
    delete circles[target]
    svg.selectAll(".twopath").remove()
}

function gen_path(source, target){
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

function draw_path(svg, policy, path_obj){
    svg.append("path")
        .datum(path_obj)
        .attr("class", "twopath")
        .attr("fill-opacity", "0")
        .attr("stroke-opacity", "1")
        .attr("stroke-width", "1")
        .attr("stroke", "#888888")
        .attr("d", d3.geoPath(policy.projection));
}
