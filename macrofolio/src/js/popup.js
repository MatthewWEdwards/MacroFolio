import css from '../css/popup.css'
import * as d3 from 'd3'
import { geoPath } from 'd3-geo'
import world_countries from './world-countries.json'

// popup.html consts
const map_id = "#d3_plot"

// SVG utils
function setup_svg(){
    var svg = d3.select(map_id).append("svg")
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
function draw_map(svg){
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
function add_circle(svg, circle){
    svg.append("path")
        .datum(circle)
        .attr("fill", circle_color)
        .attr("d", d3.geoPath(projection));
}

// Display number of unique IPs on popup.html
var el = document.getElementById('num')
chrome.storage.sync.get('num', (data)=>{
    var el = document.getElementById('num')
    el.innerHTML = data.num
})

var svg = setup_svg()
draw_map(svg)
add_circle(svg, circleGenerator())
