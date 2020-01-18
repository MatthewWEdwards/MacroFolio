import css from '../css/popup.css'
import { RenderPolicy, setup_svg, add_circle, map_range } from './map.js'
import { get_geopoints } from './ip.js'
import { Point } from './point.js'

// popup.html consts
const map_id = "#d3_plot"

// Display number of unique IPs on popup.html
var el = document.getElementById('num')
chrome.storage.local.get('num', (data)=>{
    var el = document.getElementById('num')
    el.innerHTML = data.num
})

var geopoints
async function render(){
    if(geopoints == undefined)
       geopoints  = await get_geopoints()
    let svg_range = Point.range(geopoints)
    let svg = setup_svg(map_id)
    let center = document.getElementById('center').checked
    let scale = document.getElementById('scale').checked
    let policy = new RenderPolicy(center, scale)
    let projection = await map_range(svg, svg_range, geopoints, policy)
    geopoints.forEach((geo)=>{add_circle(svg, geo.point)}) // Draw geopoints
}

function initialize(){
    document.getElementById('center').onclick = render
    document.getElementById('scale').onclick = render
    render()
}

initialize()
