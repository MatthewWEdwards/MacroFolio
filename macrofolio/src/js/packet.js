import * as d3 from 'd3'
import { draw_packet } from './draw.js'

export class Packet{
    constructor(src, target, id){
        this.src = src
        this.target = target
        this.id = id
        this.cycle = 0
        this.num_cycles = 30
    }

    iterate(svg, policy){
        this.cycle < this.num_cycles ? this.cycle++ : this.cycle = 0

        let loc = this.get_loc(this.cycle)
        policy.circle_generator.center(d3.geoInterpolate(this.src, this.target)(loc))
        draw_packet(svg, policy.circle_generator(), this.id, policy.projection)
    }

    get_loc(cycle){
        return cycle/this.num_cycles
    }
}
