import { config } from './config.json';

export { Commands };

let Commands = {
    help: function() {
        term.writeln("whoami       display effective user info");
        term.writeln("git          repo info");
        term.writeln("uname        print operating system name");
        term.writeln("ls           list directory contents");
        term.writeln("cat          list directory contents");
        term.writeln("echo         writes arguments to the standard output");
        term.writeln("pwd          return working directory name");
        term.writeln("ping         send ICMP ECHO_REQUET packets to network hosts");

    },

    whoami: function() {
        term.writeln("name: anoop nair");
        term.writeln("location: austin, texas, US");
        term.writeln("interests: scifi chess books movies robots anime manga");
    },

    git: function() {
        term.writeln("https://github.com/anoopt3k/webterminal");
    },

    uname: function() {
        term.writeln("Daneel aurora.local 1001.6.0 Daneel Kernel Version 1001.6.0: Wed Aug 10 14:25:27 PDT 4920; root:positronic-10020.191.9~8/RELEASE_PSCQBT_1024 pscQBT_1024");
    },

    ls: function(args) {
        term.writeln("/");
    },

    cat: function() {
        term.writeln("meow");
    },

    echo: function(args) {
        const message = args.join(" ");
        term.writeln(message);
    },

    pwd: function() {
        term.writeln("/root");
    },

    ping: function() {
        term.writeln("pong");
    }

}