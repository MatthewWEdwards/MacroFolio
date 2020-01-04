import css from '../css/popup.css'
import * as d3 from 'd3'
import { geoPath } from 'd3-geo'
import world_countries from './world-countries.json'

var el = document.getElementById('num')
chrome.storage.sync.get('num', (data)=>{
    var el = document.getElementById('num')
    el.innerHTML = data.num
})

var aspect_ratio = 2.25
var viewbox_ratio = 1.5
var height = 300
var width = height * aspect_ratio

var projection = d3.geoEqualEarth()

var svgContainer = d3.select("#d3_plot").append("svg")
    .attr("viewBox", "0 0 " + (width * viewbox_ratio) + " " + (height * viewbox_ratio))
    .attr("width", width)
    .attr("height", height)

svgContainer.append("path")
    .datum(world_countries)
    .attr("d", d3.geoPath(projection));
