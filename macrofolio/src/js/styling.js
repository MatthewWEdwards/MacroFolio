

function point_style(svg){
    var point_style = svg.append("defs")
        .append("filter")
        .attr("id", "point-style")

    point_style.append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("type", "matrix")
      .attr("values", "0 0 0 0 0.6 0 0 0 0 0.5333333333333333 0 0 0 0 0.5333333333333333  0 0 0 1 0")
      .attr("result","f1coloredMask");
    point_style.append("feGaussianBlur")
      .attr("in", "f1coloredMask")
      .attr("stdDeviation", 1)
      .attr("result", "f1blur");
}

function geo_style(svg){
    var filter = svg.append("defs")
      .append("filter")
      .attr("id", "geo-style");

    filter.append("feColorMatrix")
        .attr("in","SourceGraphic")
        .attr("type", "matrix")
        .attr("values", "0 0 0 0 0.6 0 0 0 0 0.5333333333333333 0 0 0 0 0.5333333333333333  0 0 0 1 0")
        .attr("result","f1coloredMask");
    filter.append("feGaussianBlur")
      .attr("in", "f1coloredMask")
      .attr("stdDeviation", 15)
      .attr("result", "f1blur");

    filter.append("feColorMatrix")
        .attr("in","SourceGraphic")
        .attr("type", "matrix")
        .attr("values", "0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 500 0")
        .attr("result","f2mask");
    filter.append("feMorphology")
        .attr("in","f2mask")
        .attr("radius","1")
        .attr("operator","erode")
        .attr("result","f2r1");
    filter.append("feGaussianBlur")
        .attr("in","f2r1")
        .attr("stdDeviation","4")
        .attr("result","f2r2");
    filter.append("feColorMatrix")
        .attr("in","f2r2")
        .attr("type", "matrix")
        .attr("values", "1 0 0 0 0.5803921568627451 0 1 0 0 0.3607843137254902 0 0 1 0 0.10588235294117647 0 0 0 -1 1")
        .attr("result","f2r3");
    filter.append("feComposite")
        .attr("operator","in")
        .attr("in","f2r3")
        .attr("in2","f2mask")
        .attr("result","f2comp");

    var feMerge = filter.append("feMerge");

    feMerge.append("feMergeNode")
        .attr("in", "f1blur");
    feMerge.append("feMergeNode")
        .attr("in", "f2comp");
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic")
}

export function map_style(svg){
    point_style(svg)
    geo_style(svg)
}
