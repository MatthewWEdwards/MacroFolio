import css from '../css/popup.css'
import * as d3 from 'd3'
import { geoPath } from 'd3-geo'

var el = document.getElementById('num')
el.innerHTML = chrome.storage.sync.get('num', (data)=>{
    var el = document.getElementById('num')
    el.innerHTML = data.num
})

var width = 2000
var height = 2000

var projection = d3.geoEqualEarth()

var svgContainer = d3.select("#d3_plot").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("transform", "translate(" + width/2 + "," + height/2 + ")")

svgContainer.append("path")
    .datum(world_countries)
    .attr("d", d3.geoPath(projection));
