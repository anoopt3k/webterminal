// index.js
import { Terminal } from '../../node_modules/xterm/lib/xterm';
//const fit = require('../../node_modules/xterm-addon-fit/lib/xterm-addon-fit.js');
//import '../../node_modules/xterm-addon-web-links/lib/xterm-addon-web-links.js');
import { run } from './sh.js';
  
function runTerm() {

    console.log("index.js: Hello World!");
    global.term = new Terminal({cursorBlink: true});
    //const fitAddon = new fit.FitAddon.FitAddon();
    //const webLinksAddon = new weblinks.WebLinksAddon.WebLinksAddon();

    term.open(document.getElementById("terminal"));
    //term.loadAddon(fitAddon);
    //term.loadAddon(webLinksAddon);
    run(term);
}

runTerm();