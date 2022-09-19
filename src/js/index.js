// index.js
const Xt = require('../../node_modules/xterm/lib/xterm');
const fit = require('../../node_modules/xterm-addon-fit/lib/xterm-addon-fit.js');
const weblinks = require('../../node_modules/xterm-addon-web-links/lib/xterm-addon-web-links.js');
const Cmd = require('./commands.js');

// TODO: make this a proper addon
const LOGO_TYPE =
  `  ____ ____   ___   ___  ____  
 / _  |  _ \ /  _ \ / _ \|  _ \ 
( ( | | | | | |_| | |_| | | | |
  \_||_|_| |_|\___/ \___/| ||_/ 
                        |_|    
                _              
 _             | |             
| |_  ____ ____| | _           
|  _)/ _  ) ___) | | \          
| |_( (/ ( (___| | | |         
  \___)____)____)_| |_|                                 

`.replaceAll("\n", "\r\n");

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

function runRootTerminal(term) {
    if (term._initialized) {
      return;
    }
  
    term.init();
    term._initialized = true;
    term.locked = false;
    term.runDeepLink();
    term.prompt();
  
    window.addEventListener("resize", term.resizeListener);
  
    term.onData(e => {
      if (term._initialized && !term.locked) {
        switch (e) {
          case '\r': // Enter
            var exitStatus;
            term.currentLine = term.currentLine.trim();
            const tokens = term.currentLine.split(" ");
            const cmd = tokens.shift();
            const args = tokens.join(" ");
  
            if (cmd != 'upgrade') {
              term.writeln("");
            }
  
            if (term.currentLine.length > 0) {
              term.history.push(term.currentLine);
              exitStatus = term.command(term.currentLine);
  
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({
                "event": "commandSent",
                "command": cmd,
                "args": args,
              });
            }
  
            if (exitStatus != 1 && cmd != 'upgrade') {
              term.prompt();
              term.clearCurrentLine(true);
            }
            break;
          case '\u0001': // Ctrl+A
            term.write('\x1b[D'.repeat(term.pos()));
            break;
          case '\u0005': // Ctrl+E
            if (term.pos() < term.currentLine.length) {
              term.write('\x1b[C'.repeat(term.currentLine.length - term.pos()));
            }
            break;
          case '\u0003': // Ctrl+C
            term.prompt();
            term.clearCurrentLine(true);
            break;
          case '\u0008': // Ctrl+H
          case '\u007F': // Backspace (DEL)
            // Do not delete the prompt
            if (term.pos() > 0) {
              const newLine = term.currentLine.slice(0, term.pos() - 1) + term.currentLine.slice(term.pos());
              term.setCurrentLine(newLine, true)
            }
            break;
          case '\033[A': // up
            var h = [...term.history].reverse();
            if (term.historyCursor < h.length - 1) {
              term.historyCursor += 1;
              term.setCurrentLine(h[term.historyCursor], false);
            }
            break;
          case '\033[B': // down
            var h = [...term.history].reverse();
            if (term.historyCursor > 0) {
              term.historyCursor -= 1;
              term.setCurrentLine(h[term.historyCursor], false);
            } else {
              term.clearCurrentLine(true);
            }
            break;
          case '\033[C': // right
            if (term.pos() < term.currentLine.length) {
              term.write('\x1b[C');
            }
            break;
          case '\033[D': // left
            if (term.pos() > 0) {
              term.write('\x1b[D');
            }
            break;
          case '\t': // tab
            cmd = term.currentLine.split(" ")[0];
            const rest = term.currentLine.slice(cmd.length).trim();
            const autocompleteCmds = Object.keys(commands).filter((c) => c.startsWith(cmd));
            var autocompleteArgs;
  
            // detect what to autocomplete
            if (autocompleteCmds && autocompleteCmds.length > 1) {
              const oldLine = term.currentLine;
              term.stylePrint(`\r\n${autocompleteCmds.sort().join("   ")}`);
              term.prompt();
              term.setCurrentLine(oldLine);
            } else if (["cat", "tail", "less", "head", "open", "mv", "cp", "chown", "chmod"].includes(cmd)) {
              autocompleteArgs = _filesHere().filter((f) => f.startsWith(rest));
            } else if (["whois", "finger", "groups"].includes(cmd)) {
              autocompleteArgs = Object.keys(team).filter((f) => f.startsWith(rest));
            } else if (["man", "woman", "tldr"].includes(cmd)) {
              autocompleteArgs = Object.keys(portfolio).filter((f) => f.startsWith(rest));
            } else if (["cd"].includes(cmd)) {
              autocompleteArgs = _filesHere().filter((dir) => dir.startsWith(rest) && !_DIRS[term.cwd].includes(dir));
            }
  
            // do the autocompleting
            if (autocompleteArgs && autocompleteArgs.length > 1) {
              const oldLine = term.currentLine;
              term.writeln(`\r\n${autocompleteArgs.join("   ")}`);
              term.prompt();
              term.setCurrentLine(oldLine);
            } else if (commands[cmd] && autocompleteArgs && autocompleteArgs.length > 0) {
              term.setCurrentLine(`${cmd} ${autocompleteArgs[0]}`);
            } else if (commands[cmd] && autocompleteArgs && autocompleteArgs.length == 0) {
              term.setCurrentLine(`${cmd} ${rest}`);
            } else if (autocompleteCmds && autocompleteCmds.length == 1) {
              term.setCurrentLine(`${autocompleteCmds[0]} `);
            }
            break;
          default: // Print all other characters
            const newLine = `${term.currentLine.slice(0, term.pos())}${e}${term.currentLine.slice(term.pos())}`;
            term.setCurrentLine(newLine, true);
            break;
        }
        term.scrollToBottom();
      }
    });
  }
  
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
    runRootTerminal(term);
}

runTerm();