/**
 * A class for correlating the IP of a host, and the estimated latitude and longitude of that IP.
 * This class is also used to store latitude and longitude points uncorrelated to a host or IP
 */
export class GeoPoint{
    /**
     * @param {Array} point A 2-length array containing the longitude and latitude respectively
     * @param {string} host The url this point corresponds to
     * @param {string} ip The endpoint IP of the host
     */
    constructor(point, host="", ip=""){
        this.host  = host
        this.ip    = ip
        this.point = point
    }

    /**
     * Set the host and ip strings to emptystrings. This is usually done when some operation is
     * performed on the GeoPoint Lat/Long such that the Lat/Long no longer corresponds to a
     * particular host and IP
     */
    strip(){
        this.host = ""
        this.ip = ""
    }

    /** 
     * Calculates the maximum and minimum latitudes and longitudes from a set of GeoPoints.
     * 
     * @param geopoints An Array of GeoPoints
     *
     * @return A Array(2) of GeoPoints. The first GeoPoint contains the minimum latitude and
     * longitude, and the second GeoPoint contains the maximum latitude and longitude.
     */
    static range(geopoints){
        var min = geopoints.reduce((smallest, current) => {
            return new GeoPoint([Math.min(smallest.point[0], current.point[0]),
                                 Math.min(smallest.point[1], current.point[1])])

        })
       var max = geopoints.reduce((largest, current) => {
            return new GeoPoint([Math.max(largest.point[0], current.point[0]),
                                 Math.max(largest.point[1], current.point[1])])
        })
        return [min, max]
    }
}
