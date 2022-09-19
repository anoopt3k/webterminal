const whoisRoot = "Anoop Nair";
const timeUnit = 1000; // useful for development, set to 10 to run faster, set to 1000 for production
let killed = false;

const help = {
  "%help%": "list all commands (you're looking at it)",
  "%whois%": "learn about me",
  "%whois% root": "learn about me",
  "%email%": "reach out to us",
  "%twitter%": "twitter account",
  "%instagram%": "instagram account",
  "%git%": "this repo",
  "%github%": "all repos",
  "%locate%": "physical address",
  "%other%": "try your fav commands (e.g. %ls%, %groups%, %su%)"
};

exports.commands = {
  help: function() {
    const maxCmdLength = Math.max(...Object.keys(help).map(x => x.length));
    Object.entries(help).forEach(function(kv) {
      const cmd = kv[0];
      const desc = kv[1];
      if (term.cols >= 80) {
        const rightPad = maxCmdLength - cmd.length + 2;
        const sep = " ".repeat(rightPad);
        term.stylePrint(`${cmd}${sep}${desc}`);
      } else {
        if (cmd != 'help') { // skip second leading newline
          term.writeln("");
        }
        term.stylePrint(cmd);
        term.stylePrint(desc);
      }
    })
  },

  whois: function(args) {
    const name = args[0];

    if (!name) {
      term.stylePrint("%whois%: Learn about person - usage:\r\n");
      term.stylePrint("%whois% root");
      term.stylePrint(`%whois% anoop`);
    } else if (name == "root") {
      const description = whoisRoot;
      term.printLogoType();
      term.stylePrint(description);
    } else if (name == "anoop") {
      const description = whoisRoot;
      term.printLogoType();
      term.stylePrint(description);
    } else {
      term.stylePrint(`User ${name || ''} not found. Try:\r\n`);
      term.stylePrint("%whois% root");
      term.stylePrint(`%whois% anoop`);
    }
  },

  git: function() {
    term.displayURL("https://github.com/anoopt3k/webterminal");
  },

  email: function() {
    term.command("pine");
  },

  github: function() {
    term.displayURL("https://github.com/anoopt3k");
  },

  twitter: function() {
    term.displayURL("https://twitter.com/anoopt3k");
  },

  instagram: function() {
    term.displayURL("https://instagram.com/aknt3k/");
  },

  other: function() {
    term.stylePrint("Yeah, I didn't literally mean %other%. I mean try some Linux commands");
  },

  echo: function(args) {
    const message = args.join(" ");
    term.stylePrint(message);
  },

  say: function(args) {
    const message = args.join(" ");
    term.stylePrint(`(Robot voice): ${message}`);
  },

  pwd: function() {
    term.stylePrint("/" + term.cwd.replaceAll("~", `home/${term.user}`));
  },

  ls: function() {
    term.stylePrint("/");
  },

  // I am so, so sorry for this code.
  cd: function(args) {
    let dir = args[0] || "~";
    if (dir != "/") {
      // strip trailing slash
      dir = dir.replace(/\/$/, "");
    }

    switch (dir) {
      case "~":
        term.cwd = "~";
        break;
      case "..":
        if (term.cwd == "~") {
          term.command("cd /home");
        } else if (["home", "bin"].includes(term.cwd)) {
          term.command("cd /");
        }
        break;
      case "../..":
      case "../../..":
      case "../../../..":
      case "/":
        term.cwd = "/";
        break;
      case "home":
        if (term.cwd == "/") {
          term.command("cd /home");
        } else {
          term.stylePrint(`You do not have permission to access this directory`);
        }
        break;
      case "/home":
        term.cwd = "home";
        break;
      case "guest":
      case "root":
        if (term.cwd == "home") {
          if (term.user == dir) {
            term.command("cd ~");
          } else {
            term.stylePrint(`You do not have permission to access this directory`);
          }
        } else {
          term.stylePrint(`No such directory: ${dir}`);
        }
        break;
      case "../home/akn":
      case "../home/la":
      case "../home/sc":
      case "../home/nico":
        if (term.cwd == "~" || term.cwd == "bin") {
          term.command(`cd ${dir.split("/")[2]}`);
        } else {
          term.stylePrint(`No such directory: ${dir}`);
        }
        break;
      case "/bin":
        term.cwd = "bin";
        break;
      case "bin":
        if (term.cwd == "/") {
          term.cwd = "bin";
        } else {
          term.stylePrint(`No such directory: ${dir}`);
        }
        break;
      case ".":
        break;
      default:
        term.stylePrint(`No such directory: ${dir}`);
        break;
    }
  },

  zsh: function() {
    term.init(term.user);
  },

  finger: function(args) {
    const user = args[0];

    switch (user) {
      case 'guest':
        term.stylePrint("Login: guest            Name: Guest");
        term.stylePrint("Directory: /home/guest  Shell: /bin/zsh");
        break;
      case 'root':
        term.stylePrint("Login: root             Name: That's Us!");
        term.stylePrint("Directory: /home/root   Shell: /bin/zsh");
        break;
      case 'anoop':
      case 'sc':
      case 'la':
      case 'nico':
        term.stylePrint(`Login: ${user}   Name: The Posse!`);
        term.stylePrint(`Directory: /home/${user}   Shell: /bin/zsh`);
        break;
      default:
        term.stylePrint(user ? `%finger%: ${user}: no such user` : "usage: %finger% [user]");
        break;
    }
  },

  groups: function(args) {
    const user = args[0];

    switch (user) {
      case 'anoop':
        term.stylePrint("engineers scifi chess book movies robots anime manga");
        break;
      case 'root':
        term.stylePrint("engineers scifi chess books movies robots anime manga admin ");
        break;
      case 'sc':
        term.stylePrint("engineers chips asic hardware");
        break;
      case 'la':
        term.stylePrint("freshman books tv piano");
        break;
      case 'nico':
        term.stylePrint("k9");
        break;
      default:
        term.stylePrint(user ? `%groups%: ${user}: no such user` : "usage: %groups% [user]");
        break;
    }
  },

  gzip: function() {
    term.stylePrint("What are you going to do with a zip file on a fake terminal, seriously?");
  },

  free: function() {
    term.stylePrint("Honestly, our memory isn't what it used to be");
  },

  tail: function(args) {
    term.command(`cat ${args.join(" ")}`);
  },

  less: function(args) {
    term.command(`cat ${args.join(" ")}`);
  },

  head: function(args) {
    term.command(`cat ${args.join(" ")}`);
  },

  open: function(args) {
    if (args[0].split(".")[1] == "html") {
      term.openURL(`./${args[0]}`, false);
    } else {
      term.command(`cat ${args.join(" ")}`);
    }
  },

  more: function(args) {
    term.command(`cat ${args.join(" ")}`);
  },

  emacs: function() {
    term.stylePrint("%emacs% not installed. try: %vi%");
  },

  vim: function() {
    term.stylePrint("%vim% not installed. try: %emacs%");
  },

  vi: function() {
    term.stylePrint("%vi% not installed. try: %emacs%");
  },

  pico: function() {
    term.stylePrint("%pico% not installed. try: %vi% or %emacs%");
  },

  nano: function() {
    term.stylePrint("%nano% not installed. try: %vi% or %emacs%");
  },

  pine: function() {
    term.openURL("mailto:root@tech");
  },

  curl: function(args) {
    term.stylePrint(`Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource ${args[0]}.`);
  },

  ftp: function(args) {
    term.command(`curl ${args.join(" ")}`);
  },

  ssh: function(args) {
    term.command(`curl ${args.join(" ")}`);
  },

  sftp: function(args) {
    term.command(`curl ${args.join(" ")}`);
  },

  scp: function(args) {
    term.stylePrint(`████████████ Request Blocked: The ███████████ Policy disallows reading the ██████ resource ${args[0]}.`);
  },

  rm: function() {
    term.stylePrint("I can't let you do that, Dave");
  },

  mkdir: function() {
    term.stylePrint("Come on, don't mess with our immaculate file system");
  },

  alias: function() {
    term.stylePrint("Just call me HAL");
  },

  df: function() {
    term.stylePrint("Nice try. Just get a Dropbox");
  },

  kill: function(args) {
    if (args && args.slice(-1) == 337) {
      killed = true;
      term.stylePrint("Phew! Thanks for killing that crypto miner process for us!");
      term.stylePrint("As a thank you for your hard work, please have a special gift on us.");
      term.stylePrint("One last thing though. We're going to need to you url encode each of those individual string parameters yourself. Sorry, the crypto miner used up all our resources. This is definitely not a test.")
    } else {
      term.stylePrint("You can't kill me!");
    }
  },

  killall: function(args) {
    term.command(`kill ${args.join(" ")}`);
  },


  locate: function() {
    term.stylePrint("anoop.tech");
    term.stylePrint("Austin, TX");
  },

  history: function() {
    term.history.forEach((element, index) => {
      term.stylePrint(`${1000 + index}  ${element}`);
    })
  },

  fdisk: function() {
    term.command("rm");
  },

  chown: function() {
    term.stylePrint("You do not have permission to %chown%");
  },

  chmod: function() {
    term.stylePrint("You do not have permission to %chmod%");
  },

  touch: function() {
    term.stylePrint("You can't %touch% this");
  },

  sudo: function(args) {
    if (term.user == "root") {
      term.command(args.join(" "));
    }
    else {
      term.stylePrint(`User is not in the sudoers file. This incident will be reported`);
    }
  },

  su: function(args) {
    user = args[0] || "root";

    if (user == "root" || user == "guest") {
      term.user = user;
      term.command("cd ~");
    } else {
      term.stylePrint("su: Sorry");
    }
  },

  quit: function() {
    term.command("exit");
  },

  stop: function() {
    term.command("exit");
  },

  whoami: function() {
    term.stylePrint(term.user);
  },

  passwd: function() {
    term.stylePrint("Wow. Maybe don't enter your password into a sketchy web-based term.command prompt?");
  },

  ping: function() {
    term.stylePrint("pong");
  },

  ps: function() {
    term.stylePrint("PID TTY       TIME CMD");
    term.stylePrint("424 ttys00 0:00.33 %-zsh%");
    term.stylePrint("158 ttys01 0:09.70 %/bin/npm start%");
    term.stylePrint("767 ttys02 0:00.02 %/bin/sh%");
    if (!killed) {
      term.stylePrint("337 ttys03 0:13.37 %/bin/cgminer -o pwn.d%");
    }
  },

  uname: function(args) {
    switch (args[0]) {
      case "-a":
        term.stylePrint("RootPC rootpc 0.0.1 RootPC Kernel Version 0.0.1 root:xnu-31415.926.5~3/RELEASE_X86_64 x86_64");
        break;
      case "-mrs":
        term.stylePrint("RootPC 0.0.1 x86_64");
        break;
      default:
        term.stylePrint("RootPC");
    }
  },

  top: function() {
    term.command("ps");
  },

  exit: function() {
    term.command("open welcome.htm");
  },

  clear: function() {
    term.init();
  },

  zed: function() {
    term.stylePrint("Coming soon! ;)");
  },

  ge: function() {
    term.command("great_expectations");
  },

  great_expectations: function() {
    term.command("superconductive");
  },

  privacy: function() {
    term.command("privacy_dynamics");
  },

  ln: function() {
    term.command("alan");
  },

  eval: function(args) {
    term.stylePrint("please instead build a webstore with macros. in the meantime, the result is: " + eval(args.join(" ")));
  },

  jobs: function() {
    term.stylePrint(`[1]   Running                 analyst &`);
    term.stylePrint(`[2]   Running                 hacker &`);
    term.stylePrint("\r\nUse %fg% [id] to see details of a job.")
    term.stylePrint("Yes, we know that's not exactly how %jobs% works, but close enough.");
  },

  bg: function(args) {
    term.stylePrint(`Sorry. If you want to background one of these jobs, you'll need to help us fill it. Try %fg% ${args} instead.`);
  },

  fg: function(args) {
    const job = jobs[args];

    if (job) {
      job.map(line => term.stylePrint(line));
      term.stylePrint(`\r\n%apply% ${args} to apply!`);
    } else {
      term.stylePrint(`job id ${args} not found.`);
    }
  }
}
