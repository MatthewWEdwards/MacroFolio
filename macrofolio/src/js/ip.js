import { links } from './links.js'
import { getStorageData } from './utils/storage.js'

var hostToIP = {};
var tabToHosts = {};
var IPtoLatLong = {};

const ip_regex = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;


export class GeoPoint{
    constructor(point, host="", ip=""){
        this.host  = host
        this.ip    = ip
        this.point = point
    }

    strip(){
        this.host = ""
        this.ip = ""
    }

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

export function processUrl(tabId, url) {
    // Get the host part of the URL. 
    var host = url; 
    var req = 'https://dns.google.com/resolve?name=' + url

    if(hostToIP[host] !== undefined)
        return

    // Get IP from a host-to-IP web service
    var x = new XMLHttpRequest();
    x.open('GET', req);
    x.onload = async function() {
        var result = JSON.parse(x.responseText);
        if (result && result.Answer){
            // Lookup successful, save address
            for(var i = 0; i < result.Answer.length; i++){
                if(!ip_regex.test(result.Answer[i].data))
                    continue
                let ip = result.Answer[i].data
                hostToIP[host] = ip
                get_lat_long(ip)
            }
         }
     }
     x.send();
    return
}

export function setPopupInfo(tabId) { // Notify all popups
    chrome.extension.getViews({type:'popup'}).forEach(function(global) {
        global.notify(tabId);
    });
}

export function count_ips(tabId){
    if(tabToHosts[tabId] == undefined)
        return
    var ips = new Set()
    for(var host = 0; host < tabToHosts[tabId].length; host++)
        ips.add(hostToIP[tabToHosts[tabId][host]])
    return ips.size
}

export function get_ips(hosts){
    var ips = Array()
    for(var host = 0; host < hosts.length; host++)
        ips.push(hostToIP[hosts[host]])
    return ips
}

export function updateLinks(tabId, html){
    let links_arr = links(html)
    tabToHosts[tabId] = links_arr
    links_arr.forEach((item, index, tabId)=>{processUrl(tabId, item)})
    chrome.storage.local.set({'links': links_arr})
}

export async function get_geopoints(){
    const data = await getStorageData(['links', 'ips', 'latlong'])
    var geos = Array()
    var ips = Array()
    for(var host = 0; host < data.links.length; host++)
        ips.push(data.ips[data.links[host]])
    for(var i = 0; i < ips.length; i++){
        let geo = data.latlong[ips[i]]
        if(geo !== undefined){
            geos.push(new GeoPoint([geo.longitude, geo.latitude], host, ips[i]))
        }
    }
    return geos
}

// XXX The online APIs may return a generic country Lat/Long, filter these out?
function get_lat_long(ip){
    //ipgeolocationapi(ip)
    freegeoip(ip)
}

function ipgeolocationapi(ip){
    if(IPtoLatLong[ip] !== undefined)
        return
    var req = 'https://api.ipgeolocationapi.com/geolocate/' + ip
    var x = new XMLHttpRequest();
    x.open('GET', req);
    x.ip = ip
    x.onload = (x)=>{save_ip_handler_ipgeolocationapi(x)}
    x.send();
}

function save_ip_handler_ipgeolocationapi(x){
    let ip = x.srcElement.ip
    let result = JSON.parse(x.srcElement.responseText);
    if(result.geo !== undefined)
        IPtoLatLong[ip] = {latitude: result.geo.latitude, longitude: result.geo.longitude}
 }

function freegeoip(ip){
    if(IPtoLatLong[ip] !== undefined)
        return
    var req = 'https://freegeoip.app/json/' + ip
    var x = new XMLHttpRequest();
    x.open('GET', req);
    x.ip = ip
    x.onload = (x)=>{save_ip_handler_freegeoip(x)}
    x.send();
}

function save_ip_handler_freegeoip(x){
    let ip = x.srcElement.ip
    let result = JSON.parse(x.srcElement.responseText);
    if(result.latitude !== undefined)
        if(result.latitude == 0 && result.longitude == 0)
            return 
        IPtoLatLong[ip] = {latitude: result.latitude, longitude: result.longitude}
 }

setInterval(()=>{
    chrome.storage.local.set({'ips': hostToIP})
    chrome.storage.local.set({'latlong': IPtoLatLong})
}, 1000)
