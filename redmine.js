var system = require('system');
var fs = require('fs');
var webpage = require('webpage');


if (system.args.length < 3) {
    show_help();
    phantom.exit(1);
}


var ticket = system.args[1];
var command_name = system.args[2];


var config = JSON.parse(fs.read("config.json"));
var REDMINE_URL = config['url'];
var login = config['login'];
var password = config['password'];


function show_help() {
    console.log('Usage: phantomjs redmine.js <ticket> <show|edit>');
}


var commands = {
    'show': {
        path: "/issues/show/",
        action: function() {console.log(page.plainText)}
    },
    'edit': {
        path: "/issues/edit/",
        action: function(status) {
            page.evaluate(function(status) {
                var select = function(selector, option) {
                    var s = document.querySelector(selector);
                    var opts = {};
                    [].slice.call(s.options).map(function(o) {
                        opts[o.textContent] = o.value;
                    });
                    s.value = opts[option];
                    return s.value;
                };
                var result = select('select#issue_status_id', status);
                console.log('status now: ' + result);
            }, status);
            page.render('s.png');
        }
    }
}


function get_command(name) {
    var c = commands[name];
    if (!c) {
        show_help();
        phantom.exit(1);
    }
    return c;
}


var page = webpage.create();
page.onConsoleMessage = function(m) {console.log(m)};


page.open(
    REDMINE_URL + '/login',
    'POST',
    'username=' + login + '&password=' + password,
    function() {
        var c = get_command(command_name);
        var url = REDMINE_URL + c.path + ticket;
        page.open(
            url,
            function() {
                c.action(system.args[3]);
                phantom.exit();
            }
        );
    }
);
