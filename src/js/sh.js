import { Commands } from './cmd.js';

export { run};

function run(term) {
    prompt(term);
    keyHandler(term);
};

function prompt(term) {
    term.write('\r\n' + "guest:m3k ~ $ ");
};

function keyHandler(term) {
    let input = '';
    term.onData(key => {
        switch (key) {
            case '\r': // Enter 
                input = input.trim();
                if (input.length === 0) {
                    input = '';
                } else {
                    term.writeln('');
                    command(term, input);
                    input = '';
                }
                prompt(term);
                break;
            case '\u0008': // Ctrl+H
            case '\u007F': // Backspace (DEL)
                if (input.length > 0) {
                    input = input.substring(0, input.length - 1);
                    term.write("\b \b");
                }
                break;
            default: // Print all other visible characters
                const keyCode = key.charCodeAt(0);
                if (keyCode > 31 && keyCode != 127) {
                    term.write(key);
                    input += key;
                }
                break;
        }
    });
};

function command(term, line) {
    const parts = line.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1, parts.length)
    const fn = Commands[cmd];
    if (typeof (fn) === "undefined") {
        term.writeln(`Command not found: ${cmd}. Try 'help' to get started.`);
    } else {
        return fn(args);
    }
};