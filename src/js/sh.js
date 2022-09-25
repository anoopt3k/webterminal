exports.sh = {
    run: function(term) {
            this.prompt(term);
            this.keyHandler(term);
        },
    prompt: function(term) {
            term.write('\r\n' + "guest:m3k ~ $ ");
        },
    keyHandler: function(term) {
        let input = '';
        term.onData(key => {
            switch (key) {
                case '\r': // Enter 
                    input = input.trim();
                    if (input.length === 0) {
                        input = '';
                    } else {
                        term.writeln('');
                        term.command(input);
                        input = '';
                    }
                    this.prompt(term);
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
    }
}