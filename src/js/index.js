// index.js
const Xt = require('../../node_modules/xterm/lib/xterm');
const fit = require('../../node_modules/xterm-addon-fit/lib/xterm-addon-fit.js');
const weblinks = require('../../node_modules/xterm-addon-web-links/lib/xterm-addon-web-links.js');
const Sh = require('./sh.js');
const Cmd = require('./cmd.js');


extend = (term) => {
    term.VERSION = term.VERSION || 2;
    term.currentLine = "";
    term.user = "guest";
    term.host = "rootpc";
    term.cwd = "~";
    term.sep = ":";
    term._promptChar = "$";
    term.history = [];
    term.historyCursor = -1;
    term.pos = () => term._core.buffer.x - term._promptRawText().length - 1;
    term._promptRawText = () => `${term.user}${term.sep}${term.host} ${term.cwd} $`;
    term.deepLink = window.location.hash.replace("#", "").split("-").join(" ");
  
    term.promptText = () => {
      var text = term._promptRawText().replace(term.user, colorText(term.user, "user"))
        .replace(term.sep, colorText(term.sep, ""))
        .replace(term.host, colorText(term.host, ""))
        .replace(term.cwd, colorText(term.cwd, "hyperlink"))
        .replace(term._promptChar, colorText(term._promptChar, "prompt"));
      return text;
    }
  
    term.timer = ms => new Promise(res => setTimeout(res, ms));
  
    term.dottedPrint = async (phrase, n, newline = true) => {
      term.write(phrase);
  
      for (let i = 0; i < n; i++) {
        await term.delayPrint('.', 1000);
      }
      if (newline) {
        term.write("\r\n");
      }
    }
  
    term.progressBar = async (t, msg) => {
      var r;
  
      if (msg) {
        term.write(msg);
      }
      term.write("\r\n[");
  
      for (let i = 0; i < term.cols / 2; i = i + 1) {
        r = Math.round(Math.random() * t / 20);
        t = t - r;
        await term.delayPrint('█', r);
      }
      term.write("]\r\n");
    }
  
    term.delayPrint = async (str, t) => {
      await term.timer(t);
      term.write(str);
    }
  
    term.delayStylePrint = async (str, t, wrap) => {
      await term.timer(t);
      term.stylePrint(str, wrap);
    }
  
    term.prompt = (prefix = "\r\n", suffix = " ") => {
      term.write(`${prefix}${term.promptText()}${suffix}`);
    };
  
    term.clearCurrentLine = (goToEndofHistory = false) => {
      term.write('\x1b[2K\r');
      term.prompt("", " ");
      term.currentLine = "";
      if (goToEndofHistory) {
        term.historyCursor = -1;
        term.scrollToBottom();
      }
    };
  
    term.setCurrentLine = (newLine, preserveCursor = false) => {
      const length = term.currentLine.length;
      term.clearCurrentLine();
      term.currentLine = newLine;
      term.write(newLine);
      if (preserveCursor) {
        term.write('\x1b[D'.repeat(length - term.pos()));
      }
    }
  
    term.stylePrint = (text, wrap = true) => {
      // Hyperlinks
      const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
      const urlMatches = text.matchAll(urlRegex);
      let allowWrapping = true;
      for (match of urlMatches) {
        allowWrapping = match[0].length < 76;
        text = text.replace(match[0], colorText(match[0], "hyperlink"));
      }
  
      // Text Wrap
      if (allowWrapping && wrap) {
        text = _wordWrap(text, Math.min(term.cols, 76));
      }
  
      // Commands
      const cmds = Object.keys(Cmd.commands);
      for (cmd of cmds) {
        const cmdMatches = text.matchAll(`%${cmd}%`);
        for (match of cmdMatches) {
          text = text.replace(match[0], colorText(cmd, "command"));
        }
      }
  
      term.writeln(text);
    };
  
    term.printLogoType = () => {
      term.writeln(term.cols >= 40 ? LOGO_TYPE : "[Anoop.Tech]\r\n");
    }
  
    term.openURL = (url, newWindow = true) => {
      term.stylePrint(`Opening ${url}`);
      if (term._initialized) {
        console.log(newWindow);
        if (newWindow) {
          window.open(url, "_blank");
        } else {
          window.location.href = url;
        }
      }
    }
  
    term.displayURL = (url) => {
      term.stylePrint(colorText(url, "hyperlink"));
    }
  
    term.command = (line) => {
      const parts = line.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1, parts.length)
      const fn = Cmd.commands[cmd];
      if (typeof (fn) === "undefined") {
        term.stylePrint(`Command not found: ${cmd}. Try 'help' to get started.`);
      } else {
        return fn(args);
      }
    }
  
    term.resizeListener = () => {
      term._initialized = false;
      term.init(term.user, true);
      term.runDeepLink();
      for (c of term.history) {
        term.prompt("\r\n", ` ${c}\r\n`);
        term.command(c);
      }
      term.prompt();
      term.scrollToBottom();
      term._initialized = true;
    };
  
    term.init = (user = "guest", preserveHistory = false) => {
      //fitAddon.fit();
      //preloadASCIIArt();
      //preloadFiles();
      term.reset();
      term.printLogoType();   
      term.stylePrint('anoop.tech!');
      term.stylePrint(`Type ${colorText("help", "command")} to get started. Or type ${colorText("exit", "command")} for web version.`, false);
  
      term.user = user;
      if (!preserveHistory) {
        term.history = [];
      }
      term.focus();
    };
  
    term.runDeepLink = () => {
      if (term.deepLink != "") {
        term.command(term.deepLink);
      }
    }
  }

   // https://stackoverflow.com/questions/14484787/wrap-text-in-javascript
  // TODO: This doesn't work well at detecting newline
  function _wordWrap(str, maxWidth) {
    var newLineStr = "\r\n"; done = false; res = '';
    while (str.length > maxWidth) {
      found = false;
      // Inserts new line at first whitespace of the line
      for (i = maxWidth - 1; i >= 0; i--) {
        if (_testWhite(str.charAt(i))) {
          res = res + [str.slice(0, i), newLineStr].join('');
          str = str.slice(i + 1);
          found = true;
          break;
        }
      }
      // Inserts new line at maxWidth position, the word is too long to wrap
      if (!found) {
        res += [str.slice(0, maxWidth), newLineStr].join('');
        str = str.slice(maxWidth);
      }
    }
    return res + str;
  }
    
function _testWhite(x) {
    var white = new RegExp(/^\s$/);
    return white.test(x.charAt(0));
};

function colorText(text, color) {
    const colors = {
      "command": "\x1b[1;35m",
      "hyperlink": "\x1b[1;34m",
      "user": "\x1b[1;33m",
      "prompt": "\x1b[1;32m",
      "bold": "\x1b[1;37m"
    }
    return `${colors[color] || ""}${text}\x1b[0;38m`;
  }
  

function runTerm() {

    console.log("index.js: Hello World!");
    global.term = new Xt.Terminal({cursorBlink: true});
    //const fitAddon = new fit.FitAddon.FitAddon();
    //const webLinksAddon = new weblinks.WebLinksAddon.WebLinksAddon();

    term.open(document.getElementById("terminal"));
    //term.loadAddon(fitAddon);
    //term.loadAddon(webLinksAddon);
    extend(term);
    Sh.sh.run(term);
}

runTerm();