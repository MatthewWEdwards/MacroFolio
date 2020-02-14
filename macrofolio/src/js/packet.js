import * as d3 from 'd3'
import { draw_packet } from './draw.js'

const PACKET_CLASS = '.packet'

/**
 * Singleton class for controlling Packets
 */
class PacketManager{
    constructor(){
        if(!PacketManager.instance){
            this._packets = {}
            this.active = 0
            this.max_active = 15
            this.tick_interval = 40
            this.interval = null
            PacketManager.instance = this
        }
        return PacketManager.instance
    }

    count(){
        return Object.entries(this._packets).length
    }

    add(packet, id){
        this._packets[id] = packet
    }

    start(svg, policy){
        this.svg = svg
        this.policy = policy

        d3.selectAll(PACKET_CLASS).remove()

        let odds = (this.max_active / (3*Object.entries(this._packets).length)) * (this.max_active - this.active)
        for(let packet of Object.entries(this._packets)){
            if(Math.random() < odds && this.active < this.max_active){
                packet[1].iterate(svg, policy)
                this.active += 1
            }
        }
        this.interval = setInterval(this.tick.bind(this), this.tick_interval)
    }

    stop(){
        clearInterval(this.interval)
        this._packets = {}
        this.active = 0
    }
    
    /**
     * Not threadsafe
     */
    tick(){
        d3.selectAll(PACKET_CLASS).remove()

        // Iterate packets
        let new_active = 0
        for(let packet of Object.entries(this._packets)){
            if(packet[1].cycle > 0){
                var finished = packet[1].iterate(this.svg, this.policy)
                if(!finished)
                    new_active += 1
            }
        }
        this.active = new_active

        // Start new packets 
        let odds = (this.max_active / Object.entries(this._packets).length) * (this.max_active - this.active)
        Object.entries(this._packets).forEach((packet)=>{
            if(!(this.active >= this.max_active)){
                if(!packet[1].cycle != 0){
                    if(Math.random() < odds){
                        packet[1].iterate()
                        this.active += 1
                    }
                }
            }
        })
    }
}

// PacketManager singleton
const packet_manager = new PacketManager()
export { packet_manager }

export class Packet{
    constructor(src, target, id){
        this.src = src
        this.target = target
        this.id = id
        this.cycle = -1
        this.num_cycles = 30
    }

    iterate(svg, policy){
        this.cycle < this.num_cycles ? this.cycle++ : this.cycle = 0
        let loc = this.get_loc(this.cycle)
        policy.circle_generator.center(d3.geoInterpolate(this.src, this.target)(loc))
        draw_packet(svg, policy.circle_generator(), this.id, policy.projection)
        return this.cycle == 0
    }

    get_loc(cycle){
        return cycle/this.num_cycles
    }
}
