import * as d3 from 'd3'
import { geoPath } from 'd3-geo'
import world_countries from './world-countries.json'
import { Point, GeoPoint, CartesianPoint } from './point.js'
import { map_style } from './styling.js'
import { range, scale } from './math.js'
import { gen_path, draw_paths, get_packet } from './path.js' 
import { draw_viewbox, draw_circle, draw_packet } from './draw.js'
import { Packet } from './packet.js'
import async from 'async'

// Nice styling for maps: https://www.colourlovers.com/palette/2590280/Old_Style_Map
// d3 map filters: http://geoexamples.blogspot.com/2014/01/d3-map-styling-tutorial-ii-giving-style.html

// Circle vars TODO: Manage these better
var circles = {}
var circle_cnt = 0
var packets = {}
var packet_cnt = 0
var target

export class RenderPolicy{
    constructor(center=true, 
                scale=true, 
                debug=false, 
                padding=25, 
                projection="geoEqualEarth",
                color="#000000",
                circle_radius=.5,
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
    return draw_viewbox(id, policy)
}

// Circle funcs
export function add_circle(svg, policy, color=undefined, center=[0,0]){
    // If circle is duplicate, ignore
    for(var circle in circles)
        if(circles[circle] == center)
            return [0, 0]

    if(color === undefined)
        color = policy.circle_color

    policy.circle_generator.center(center)
    let circle_id = "circle_" + circle_cnt
    draw_circle(svg, policy.circle_generator(), circle_id, 'source-point-style', policy.projection)
    circle_id = "#" + circle_id
    circles[circle_id] = center
    circle_cnt += 1
    return circle_id
}

function add_packet(svg, policy, color=undefined, src, target){
    if(color === undefined)
        color = policy.circle_color

    let packet_id = "packet_" + packet_cnt
    packet_id = "#" + packet_id
    packet_cnt += 1
    let packet = new Packet(src, target, packet_id)
    packet.iterate(svg, policy)
    packets[packet_id] = packet

    return packet_id
}

function clear_packets(svg){
    svg.selectAll(".packet").remove()
    packets = {}
    packet_cnt = 0
}


export function map_range(svg, geos, policy){
    // Circle vars TODO: Manage these better
    circles = {}
    circle_cnt = 0
    target = 0

    if(policy == undefined || typeof policy != typeof new RenderPolicy()){
        policy = new RenderPolicy()
    }

    policy.reset_projection()
    let projection = policy.projection

    // Center
    if(policy.center)
        projection.center(Point.center(geos))
    
    // Scale
    let new_scale = scale(policy, projection, geos, policy.padding)
    if(policy.scale){
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

var interval

function set_target_loc(svg, policy, loc){
    remove_target(svg)
    target = add_circle(svg, policy, "#999999", loc)

    var features = []
    async.each(circles, function(circle){
        features.push(gen_path(circle, loc))
        console.log(add_packet(svg, policy, "#00ff00", circle, loc, false))
    })
    draw_paths(svg, policy, features)
    interval = setInterval(()=>{d3.selectAll('.packet').remove();Object.entries(packets).forEach((packet)=>{packet[1].iterate(svg, policy)})}, 100)
}

function remove_target(svg){
    d3.select(target).remove()
    clear_packets(svg)
    clearInterval(interval)
    delete circles[target]
    svg.selectAll(".twopath").remove()
}

