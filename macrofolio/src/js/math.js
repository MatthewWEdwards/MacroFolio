import { Point } from './point.js'

export function range(policy, projection, geos, pad){
    let center_latlong = Point.center(geos)
    let extent = Point.range(geos)
    let extent_geo = extent.map(point => projection(point.point))

    let scale = projection.scale()/100
    let cut_width = policy.width*scale
    let cut_height = policy.height*scale

    let top_left, bot_right
    if(policy.center){
        let clip_width  = Math.abs(extent_geo[0][0] - extent_geo[1][0])/2 + pad
        let clip_height = Math.abs(extent_geo[0][1] - extent_geo[1][1])/2 + pad

        let center_xy = projection(center_latlong)
        let cx = center_xy[0]
        let cy = center_xy[1]

        top_left  = [Math.max(0, cx - clip_width), Math.max(0, cy - clip_height)]
        bot_right = [Math.min(cut_width, cx + clip_width), Math.min(cut_height, cy + clip_height)]

    }else{
        let carts = Array()
        geos.forEach((geo)=>{carts.push(geo.toCartesian(projection))})
        let extremes = Point.range(carts)
        top_left = extremes[0].point
        bot_right = extremes[1].point

        top_left[0] = Math.max(0, top_left[0] - pad)
        top_left[1] = Math.max(0, top_left[1] - pad)
        bot_right[0] = Math.min(cut_width, bot_right[0] + pad)
        bot_right[1] = Math.min(cut_height, bot_right[1] + pad)
    }
    return [top_left, bot_right]
}

export function scale(policy, projection, geos, pad){
    let old_scale = projection.scale()/100
    let cut_width = policy.width*old_scale
    let cut_height = policy.height*old_scale

    let map_range = range(policy, projection, geos, pad)
    let top_left = map_range[0]
    let bot_right = map_range[1]

    let new_width  = (bot_right[0] - top_left[0])
    let new_height = (bot_right[1] - top_left[1])
    let dialation_x = new_width/cut_width
    let dialation_y = new_height/cut_height
    let new_scale = Math.min(dialation_x, dialation_y)

    top_left[0] = top_left[0] - top_left[0]/(new_scale)
    top_left[1] = top_left[1] - top_left[1]/(new_scale)
    bot_right[0] = bot_right[0]/new_scale
    bot_right[1] = bot_right[1]/new_scale

    return new_scale
}
