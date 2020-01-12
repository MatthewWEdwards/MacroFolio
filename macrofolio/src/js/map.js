import * as d3 from 'd3'
import { geoPath } from 'd3-geo'
import world_countries from './world-countries.json'
import { GeoPoint } from './geopoint.js'

class RenderPolicy{
    constructor(crop=true, center=true, scale=true){
       this.crop = crop
       this.center = center
       this.scale = scale
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

export function map_range(svg, extent, policy){
    if(policy == undefined || typeof policy != RenderPolicy)
        policy = new RenderPolicy()

    // Center
    var center = GeoPoint.center(extent[0], extent[1])
    
    // Clip
    const pad = 50
    let extent_proj = extent.map(point => projection(point.point))
    let clip, top_left, bot_right

    let scale = projection.scale()/100
    let cut_width = width*scale
    let cut_height = height*scale

    if(false){
        let clip_width = Math.abs(extent_proj[0][0] - extent_proj[1][0])/2 + pad
        let clip_height = Math.abs(extent_proj[0][1] - extent_proj[1][1])/2 + pad

        let center_xy = projection(policy.center ? center : [0,0])
        let cx = center_xy[0]
        let cy = center_xy[1]

        top_left  = [Math.max(0, cx - clip_width), Math.max(0, cy - clip_height)]
        bot_right = [Math.min(cut_width, cx + clip_width), Math.min(cut_height, cy + clip_height)]
        clip = [top_left, bot_right]
    }else{
        top_left = [Math.min(extent_proj[0][0], extent_proj[1][0]), Math.min(extent_proj[0][1], extent_proj[1][1])]
        bot_right = [Math.max(extent_proj[0][0], extent_proj[1][0]), Math.max(extent_proj[0][1], extent_proj[1][1])]
        let extent_clip = [top_left, bot_right]
        clip = [[Math.max(0, extent_clip[0][0]-pad), Math.max(0, extent_clip[0][1]-pad)],
                  [Math.min(width, extent_clip[1][0]+pad), Math.min(height, extent_clip[1][1]+pad)]]
    }

    // Scale
    if(policy.center){
        let new_width  = (bot_right[0] - top_left[0])
        let new_height = (bot_right[1] - top_left[1])
        let dialation_x = new_width/cut_width
        let dialation_y = new_height/cut_height
        console.log(`dx: ${dialation_x}, dy: ${dialation_y}`)
        let new_scale = Math.min(dialation_x, dialation_y)

        top_left[0] = top_left[0] - top_left[0]*new_scale
        top_left[1] = top_left[1] - top_left[1]*new_scale
        bot_right[0] = bot_right[0]/new_scale
        bot_right[1] = bot_right[1]/new_scale
    }

    if(policy.center){
        projection.center(center)
    }
    if(policy.crop){
        projection.clipExtent(clip)
    }
    if(policy.scale){
        projection.scale(100/new_scale)
    }


    svg.append("path")
        .datum(world_countries)
        .attr("d", d3.geoPath(projection));
}

