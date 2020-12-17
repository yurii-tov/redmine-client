var page = require('webpage').create();
var system = require('system');
var fs = require('fs');


if (system.args.length < 3) {
    show_help();
    phantom.exit(1);
}


var ticket = system.args[1];
var command = system.args[2];


var config = JSON.parse(fs.read("config.json"));
var REDMINE_URL = config['url'];
var login = config['login'];
var password = config['password'];


function show_help() {
    console.log('Usage: phantomjs redmine.js <ticket> <show|close>');
}


var commands = {
    'show': function() {console.log(page.plainText)},
    'close': function() {console.log('close: TBA')}
};


function process_ticket(command) {
    var c = commands[command];
    if (!c) {
        show_help();
        phantom.exit(1);
    }
    c();
}


page.open(
    REDMINE_URL + '/login',
    'POST',
    'username=' + login + '&password=' + password,
    function() {
        page.open(
            REDMINE_URL + '/issues/show/' + ticket,
            function() {
                process_ticket(command);
                phantom.exit();
            }
        );
    }
);
