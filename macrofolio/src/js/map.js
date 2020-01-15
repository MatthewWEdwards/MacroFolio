import * as d3 from 'd3'
import { geoPath } from 'd3-geo'
import world_countries from './world-countries.json'
import { Point, GeoPoint, CartesianPoint } from './geopoint.js'

class RenderPolicy{
    constructor(center=true, scale=true, debug=true){
       this.center = center
       this.scale = scale
       this.debug = debug
    }
}

// SVG utils
export function setup_svg(id){
    var svg = d3.select(id).append("svg")
        .attr("viewBox", "0 0 " + (width * viewbox_ratio) + " " + (height * viewbox_ratio))
        .attr("width", width)
        .attr("height", height)
    return svg
}

// World map consts
const aspect_ratio = 2.25
const viewbox_ratio = 1.5
const height = 300
const width = height * aspect_ratio
const projection = d3.geoEqualEarth()

// World map funcs
export function draw_map(svg){
    svg.append("path")
        .datum(world_countries)
        .attr("d", d3.geoPath(projection));
}

// Circle consts
const circle_color = "#ff0000"
const circle_radius = 1
const circleGenerator = d3.geoCircle()
circleGenerator.radius(circle_radius)

// Circle funcs
export function add_circle(svg, center=[0,0], color=circle_color){
    circleGenerator.center(center)
    svg.append("path")
        .datum(circleGenerator())
        .attr("fill", color)
        .attr("d", d3.geoPath(projection));
}

export function map_range(svg, extent, geos, policy){
    if(policy == undefined || typeof policy != RenderPolicy)
        policy = new RenderPolicy()


    // Center
    var center = Point.center(extent[0], extent[1])
    if(policy.center)
        projection.center(center)
    
    // Get extreme top-left and bottom-right points
    const pad = 25
    let extent_geo = extent.map(point => projection(point.point))
    let clip, top_left, bot_right

    let scale = projection.scale()/100
    let cut_width = width*scale
    let cut_height = height*scale

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
        console.log(carts)
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
        console.log(`dx: ${dialation_x}, dy: ${dialation_y}`)
        new_scale = Math.min(dialation_x, dialation_y)
        console.log(new_scale)

        top_left[0] = top_left[0] - top_left[0]/(1-new_scale)
        top_left[1] = top_left[1] - top_left[1]/(1-new_scale)
        bot_right[0] = bot_right[0]/new_scale
        bot_right[1] = bot_right[1]/new_scale
        projection.scale(100/new_scale)
    }

    // Debug
    if(policy.debug){
        add_circle(svg, projection.invert(top_left), "#00ff00")
        add_circle(svg, projection.invert(bot_right), "#0000ff")
    }

    svg.append("path")
        .datum(world_countries)
        .attr("d", d3.geoPath(projection));
}

