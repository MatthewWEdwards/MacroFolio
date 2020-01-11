import * as d3 from 'd3'
import { geoPath } from 'd3-geo'
import world_countries from './world-countries.json'

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
export function add_circle(svg, center=[0,0]){
    circleGenerator.center(center)
    svg.append("path")
        .datum(circleGenerator())
        .attr("fill", circle_color)
        .attr("d", d3.geoPath(projection));
}

export function map_range(svg, x, y){
    console.log(projection.invert(x))
    console.log(projection.invert(y))
    svg.append("path")
        .datum(world_countries)
        .attr("d", d3.geoPath(projection));
}
