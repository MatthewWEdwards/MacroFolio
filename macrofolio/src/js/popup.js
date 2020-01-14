import css from '../css/popup.css'
import { setup_svg, draw_map, add_circle, map_range } from './map.js'
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

var svg = setup_svg(map_id)

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
function draw_geopoints(){
    get_geopoints().then((geos)=>{
        geos.forEach((geo)=>{
            add_circle(svg, geo.point)
        })
    })
}

async function render(){
    var svg_range = await latlong_range()
    map_range(svg, svg_range, await get_geopoints())
    draw_geopoints()
}

render()
