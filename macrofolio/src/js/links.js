const url_match = /(?:ht|f)tps?:\/\/[-a-zA-Z0-9.]+\.[a-zA-Z]{2,3}(?:\/(?:[^"<=]|=)*)?/gi

export function links(str){
    return str.match(url_match)
}
