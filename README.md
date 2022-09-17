# web-template
Template for web development


(1) yarn package manager installs all dependencies
(2) webpack combines all js into build/js/app.js, copies index.html and inserts app.js in there
(3) webpack starts devserver that serves content from build
(4) docker built based on node docker. all source files copied into /usr/src in docker. 
(5) invokes yarn build and yarn start commands to start server on port 8080 that is forwarded to external ip.