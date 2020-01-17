import css from '../css/popup.css'
import { RenderPolicy, setup_svg, add_circle, map_range } from './map.js'
import { get_geopoints } from './ip.js'
import { Point } from './geopoint.js'

// popup.html consts
const map_id = "#d3_plot"

// Display number of unique IPs on popup.html
var el = document.getElementById('num')
chrome.storage.local.get('num', (data)=>{
    var el = document.getElementById('num')
    el.innerHTML = data.num
})

/**
 * Returns the minimum and maximum latitudes and longitudes for the currently active links
 */
async function latlong_range(){
    return new Promise( async (resolve, reject) => {
        var geos = await get_geopoints()
        resolve(Point.range(geos))
    })
}

/**
 * Draw circles on the geolocation of the endpoint IP of the currently active links
 */
function draw_geopoints(svg){
    get_geopoints().then((geos)=>{
        geos.forEach((geo)=>{
            add_circle(svg, geo.point)
        })
    })
}

var geopoints, svg_range
async function initialize(){
    geopoints = await get_geopoints()
    svg_range = await latlong_range()
}

async function render(){
    if(geopoints == undefined || svg_range == undefined)
        await initialize()
    let svg = setup_svg(map_id)
    let center = document.getElementById('center').checked
    let scale = document.getElementById('scale').checked
    let policy = new RenderPolicy(center, scale)
    console.log(svg_range)
    console.log(geopoints)
    map_range(svg, svg_range, geopoints, policy)
    draw_geopoints(svg)
}

document.getElementById('center').onclick = render
document.getElementById('scale').onclick = render

render()
