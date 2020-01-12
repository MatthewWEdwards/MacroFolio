import css from '../css/popup.css'
import { setup_svg, draw_map, add_circle, map_range } from './map.js'
import { GeoPoint, get_geopoints } from './ip.js'

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
        var min = geos.reduce((smallest, current) => {
            return new GeoPoint([Math.min(smallest.point[0], current.point[0]),
                                 Math.min(smallest.point[1], current.point[1])])

        })
       var max = geos.reduce((largest, current) => {
            return new GeoPoint([Math.max(largest.point[0], current.point[0]),
                                 Math.max(largest.point[1], current.point[1])])
        })
       resolve([min, max])
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
    map_range(svg, svg_range)
    draw_geopoints()
}

render()
