
function shuffle(array) {
  // https://bost.ocks.org/mike/shuffle/
  var m = array.length, t, i;
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);
    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

// Element to move, time in ms to animate
function scrollTo(element, duration) {
    var e = document.documentElement;
    if(e.scrollTop===0){
        var t = e.scrollTop;
        ++e.scrollTop;
        e = t+1===e.scrollTop--?e:document.body;
    }
    scrollToC(e, e.scrollTop, element, duration);
}

// Element to move, element or px from, element or px to, time in ms to animate
function scrollToC(element, from, to, duration) {
    if (duration <= 0) return;
    if(typeof from === "object")from=from.offsetTop;
    if(typeof to === "object")to=to.offsetTop;

    scrollToX(element, from, to, 0, 1/duration, 20, easeOutCuaic);
}

function scrollToX(element, xFrom, xTo, t01, speed, step, motion) {
    if (t01 < 0 || t01 > 1 || speed<= 0) {
        element.scrollTop = xTo;
        return;
    }
    element.scrollTop = xFrom - (xFrom - xTo) * motion(t01);
    t01 += speed * step;

    setTimeout(function() {
        scrollToX(element, xFrom, xTo, t01, speed, step, motion);
    }, step);
}
function easeOutCuaic(t){
    t--;
    return t*t*t+1;
}

var downloadFile = function(json) {
  window.URL = window.webkitURL || window.URL;
  $("#downloadLink").html("");

  var bb = new Blob([JSON.stringify(json)], {type:'text/plain'});

  var a = document.createElement('a');
  a.download = "entertaining_things.json";
  a.href = window.URL.createObjectURL(bb);
  a.textContent = 'Download ready';

  a.style.fontSize = "2em";

  a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');

  $("#downloadLink").css("padding-top", "3em");
  $("#downloadLink").append(a);

  a.onclick = function(e) {
    if ('disabled' in this.dataset) {
      return false;
    }

    // cleanUp(this);
  };
};