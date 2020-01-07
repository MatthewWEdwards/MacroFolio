import css from '../css/popup.css'
import { setup_svg, draw_map, add_circle } from './map.js'

// popup.html consts
const map_id = "#d3_plot"

// Display number of unique IPs on popup.html
var el = document.getElementById('num')
chrome.storage.sync.get('num', (data)=>{
    var el = document.getElementById('num')
    el.innerHTML = data.num
})

var svg = setup_svg(map_id)
draw_map(svg)
add_circle(svg)
