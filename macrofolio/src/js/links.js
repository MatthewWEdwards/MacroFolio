const url_match = /(?:ht|f)tps?:\/\/([-a-zA-Z0-9.]+\.[a-zA-Z]{2,3})(?:\/(?:[^"<=]|=)*)?/gi
const domain_match = /(?:ht|f)tps?:\/\/([-a-zA-Z0-9.]+\.[a-zA-Z]{2,3})(?:\/(?:[^"<=]|=)*)?/i

export function links(str){
    let urls = str.match(url_match)
    urls.forEach((url, idx, arr)=>{arr[idx] = domain_match.exec(url)[1]})
    return urls
}
