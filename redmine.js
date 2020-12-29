var system = require('system');
var fs = require('fs');
var webpage = require('webpage');


if (system.args.length < 3) {
    show_help();
    phantom.exit(1);
}


var command_name = system.args[1];
var ticket = system.args[2];


var config = JSON.parse(fs.read("config.json"));
var REDMINE_URL = config['url'];
var login = config['login'];
var password = config['password'];


function show_help() {
    console.log('Usage:');
    console.log('phantomjs redmine.js show <ticket>');
    console.log('phantomjs redmine.js edit <ticket> [updates]');
    console.log('    where [updates] is a json:');
    console.log('    {"status": "new status",');
    console.log('     "comment": "some comment"}');
}


var commands = {
    'show': {
        path: "/issues/show/",
        action: function() {
            var text = page.plainText;
            console.log(text.substring(text.match(/.*#\d+/).index));
        }
    },
    'edit': {
        path: "/issues/edit/",
        onLoadFinished: function(status) {
            setTimeout(function() {
                phantom.exit();
            }, 1500);
        },
        action: function(update) {
            page.evaluate(function(update) {
                var select = function(selector, option) {
                    var s = document.querySelector(selector);
                    var opts = {};
                    [].slice.call(s.options).map(function(o) {
                        opts[o.textContent] = o.value;
                    });
                    s.value = opts[option];
                    return s.value;
                };
                var type = function(selector, text) {
                    var i = document.querySelector(selector);
                    i.value = text;
                    return i.value;
                };
                var edit = function(update) {
                    var edits = {
                        status: function(s) {select('select#issue_status_id', s)},
                        comment: function(c) {type('textarea#notes', c)}
                    };
                    for (k in update) {
                        var v = update[k];
                        var e = edits[k];
                        e(v);
                    }
                    document.querySelector('#issue-form input[name=commit]').click();
                };
                update && edit(JSON.parse(update));
            }, update);
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
        page.onLoadFinished = c.onLoadFinished;
        page.open(
            url,
            function() {
                c.action(system.args[3]);
                c.onLoadFinished || phantom.exit();
            }
        );
    }
);
