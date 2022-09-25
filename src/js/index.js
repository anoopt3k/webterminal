// index.js
const Xt = require('../../node_modules/xterm/lib/xterm');
const fit = require('../../node_modules/xterm-addon-fit/lib/xterm-addon-fit.js');
const weblinks = require('../../node_modules/xterm-addon-web-links/lib/xterm-addon-web-links.js');
const Sh = require('./sh.js');
  
function runTerm() {

    console.log("index.js: Hello World!");
    global.term = new Xt.Terminal({cursorBlink: true});
    //const fitAddon = new fit.FitAddon.FitAddon();
    //const webLinksAddon = new weblinks.WebLinksAddon.WebLinksAddon();

    term.open(document.getElementById("terminal"));
    //term.loadAddon(fitAddon);
    //term.loadAddon(webLinksAddon);
    Sh.sh.run(term);
}

runTerm();