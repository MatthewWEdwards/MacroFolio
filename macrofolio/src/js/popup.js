import css from '../css/popup.css'
import { setup_svg, draw_map, add_circle } from './map.js'
import { get_ips, IPtoLatLong } from './ip.js'

// popup.html consts
const map_id = "#d3_plot"

// Display number of unique IPs on popup.html
var el = document.getElementById('num')
chrome.storage.local.get('num', (data)=>{
    var el = document.getElementById('num')
    el.innerHTML = data.num
})

var svg = setup_svg(map_id)
draw_map(svg)

function draw_geo_ips(){
    chrome.storage.local.get(['links', 'ips', 'latlong'], (data)=>{
        var ips = Array()
        for(var host = 0; host < data.links.length; host++)
            ips.push(data.ips[data.links[host]])
        for(var i = 0; i < ips.length; i++){
            let geo = data.latlong[ips[i]]
            if(geo !== undefined){
                let center = [geo.latitude, geo.longitude]
                add_circle(svg, center)
            }
        }
    })
}

draw_geo_ips()
