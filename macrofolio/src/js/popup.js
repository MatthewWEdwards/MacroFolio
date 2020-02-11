import { RenderPolicy, setup_svg, add_circle, map_range } from './map.js'
import { get_geopoints } from './ip.js'
import { Point } from './point.js'

// Includes
import './jquery.min.js'
import './bootstrap.min.css'
import '../scss/popup.scss'
import '../scss/map.scss'

import './bootstrap.min.js'
import '../fonts/Gudea-Bold.ttf'
import '../fonts/Gudea-Italic.ttf'
import '../fonts/Gudea-Regular.ttf'

// popup.html consts
const map_id = "#d3_plot"

var padding = 25

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

    // Prepare render policy
    let center = document.getElementById('center-check').checked
    let scale = document.getElementById('center-check').checked
    console.log(center)
    let policy = new RenderPolicy(center, scale)

    let svg = setup_svg(map_id, policy)

    policy.padding = get_padding()

    let projection = await map_range(svg, geopoints, policy)
    geopoints.forEach((geo)=>{add_circle(svg, policy, "#000000", geo.point)}) // Draw geopoints
}


function get_padding(policy){
    return padding
}

function initialize(){
    document.getElementById('center-check').onclick = render
    render()

    document.getElementById('pad-large').addEventListener("click", ()=>{padding=25;render()})
    document.getElementById('pad-medium').addEventListener("click", ()=>{padding=50;render()})
    document.getElementById('pad-small').addEventListener("click", ()=>{padding=100;render()})
}

initialize()
