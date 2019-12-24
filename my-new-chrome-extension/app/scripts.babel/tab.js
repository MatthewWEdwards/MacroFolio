import { traceroute } from 'traceroute'
 
window.onload = function() { 
}

traceroute.trace('google.com', function (err,hops) {
  if (!err) console.log(hops);
});
