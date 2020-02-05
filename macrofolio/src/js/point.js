// TODO: Make this N-dimensional?
export class Point{
    constructor(point, host="", ip=""){
        this.host  = host
        this.ip    = ip
        this.point = point
    }

    strip(){
        this.host = ""
        this.ip = ""
    }

    /** 
     * Calculates the maximum and minimum latitudes and longitudes from a set of Points.
     * 
     * @param {Array} points An Array of Points
     *
     * @return {Array} A Array(2) of Points. The first Point contains the minimum dimensions of 
     * the points array, and the second Point contains the maximum values.
     */
    static range(points){
        if(points.length == 0){
            return [[0,0],[0,0]]
        }

        var min = points.reduce((smallest, current) => {
            return new GeoPoint([Math.min(smallest.point[0], current.point[0]),
                                 Math.min(smallest.point[1], current.point[1])])

        })
       var max = points.reduce((largest, current) => {
            return new GeoPoint([Math.max(largest.point[0], current.point[0]),
                                 Math.max(largest.point[1], current.point[1])])
        })
        return [min, max]
    }

    static middle(point1, point2){
        return [(point1.point[0] + point2.point[0])/2, (point1.point[1] + point2.point[1])/2]
    }

    static center(points){
        let extent = this.range(points)
        return this.middle(extent[0], extent[1])
    }

}


/**
 * A class for correlating the IP of a host, and the estimated latitude and longitude of that IP.
 * This class is also used to store latitude and longitude points uncorrelated to a host or IP
 */
export class GeoPoint extends Point{
    //TODO
    is_valid(){
    }

    toCartesian(projection){
        return new CartesianPoint(projection(this.point), this.host, this.ip)
    }
}

export class CartesianPoint extends Point{
    toGeo(projection){
        return new GeoPoint(projection.invert(this.point), this.host, this.ip)
    }
}


