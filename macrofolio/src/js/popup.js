import css from '../css/popup.css'
import { setup_svg, draw_map, add_circle, map_range } from './map.js'
import { get_geo_ips } from './ip.js'

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
        var geos = await get_geo_ips()
        var min = geos.reduce((smallest, current) => {
            return [Math.min(smallest[0], current[0]),
                    Math.min(smallest[1], current[1])]
        })
       var max = geos.reduce((smallest, current) => {
            return [Math.max(smallest[0], current[0]),
                    Math.max(smallest[1], current[1])]
        })
       resolve([min, max])
    })
}

/**
 * Draw circles on the geolocation of the endpoint IP of the currently active links
 */
function draw_geo_ips(){
    get_geo_ips().then((geos)=>{
        geos.forEach((geo)=>{
            add_circle(svg, geo)
        })
    })
}

async function render(){
    var svg_range = await latlong_range()
    map_range(svg, svg_range)
    //draw_map(svg)
    draw_geo_ips()
}

render()
