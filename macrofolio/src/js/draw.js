import * as d3 from 'd3'
const circle_style = 'point-style'


export function draw_viewbox(id, policy){
    return d3.select(id).append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (policy.width * policy.viewbox_ratio) + " " + (policy.height * policy.viewbox_ratio))
        .classed("svg-content", true);
}

export function draw_circle(svg, circle, id, cls, projection){
    svg.append("path")
        .datum(circle)
        .attr("fill", "#000000")
        .attr("class", cls)
        .style("filter", "url(#point-style)")
        .attr("id", id)
        .attr("d", d3.geoPath(projection))
}

export function draw_packet(svg, circle, id, projection){
    svg.append("path")
        .datum(circle)
        .attr("fill", "#EEEEEE")
        .attr("class", "packet")
        .style("filter", "url(#point-style)")
        .attr("id", id)
        .attr("d", d3.geoPath(projection))
}
