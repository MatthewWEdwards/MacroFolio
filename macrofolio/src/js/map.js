import * as d3 from 'd3'
import { geoPath } from 'd3-geo'
import world_countries from './world-countries.json'
import { GeoPoint } from './geopoint.js'

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

export function map_range(svg, extent){
    // Center
    var center = GeoPoint.center(extent[0], extent[1])
    projection.center(center)
    
    // Clip
    const pad = 50
    let extent_proj = extent.map(point => projection(point.point))
    let clip_width = Math.abs(extent_proj[0][0] - extent_proj[1][0])/2 + pad
    let clip_height = Math.abs(extent_proj[0][1] - extent_proj[1][1])/2 + pad

    let scale = projection.scale()/100
    let cut_width = width*scale
    let cut_height = height*scale

    let center_xy = projection(center)
    let cx = center_xy[0]
    let cy = center_xy[1]

    let top_left  = [Math.max(0, cx - clip_width), Math.max(0, cy - clip_height)]
    let bot_right = [Math.min(cut_width, cx + clip_width), Math.min(cut_height, cy + clip_height)]
    let clip = [top_left, bot_right]
    projection.clipExtent(clip)

    svg.append("path")
        .datum(world_countries)
        .attr("d", d3.geoPath(projection));
}
