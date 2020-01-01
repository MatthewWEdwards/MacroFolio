import css from '../css/popup.css'
import * as d3 from 'd3'
import { geoEqualEarth, geoPath } from 'd3-geo'

var el = document.getElementById('num')
el.innerHTML = chrome.storage.sync.get('num', (data)=>{
    var el = document.getElementById('num')
    el.innerHTML = data.num
})


let old = d3.selectAll('svg')

if(!(old === undefined)){
    old.remove()
}

var width = 1000
var height = 1000

var svgContainer = d3.select("#d3_plot").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("border", "2px solid steelblue");

console.log("FOO")
console.log(world_countries)

svgContainer.append("path")
    .datum(world_countries)
    .attr("d", d3.geoPath());

console.log("END")
