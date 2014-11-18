'use strict';

var debug = require('debug')('scrat:init:generator'),
    yeoman = require('yeoman-generator'),
    semver = require('semver'),
    rimraf = require('rimraf'),
    path = require('path'),
    fs = require('fs'),
    slice = Array.prototype.slice,
    toString = Object.prototype.toString,
    tmpPath = fis.project.getTempPath('init'),
    proto;

function Generator(args, options) {
    yeoman.generators.Base.apply(this, arguments);

    this._.templateSettings.escape = /<\$-([\s\S]+?)\$>/g;
    this._.templateSettings.evaluate = /<\$([\s\S]+?)\$>/g;
    this._.templateSettings.interpolate = /<\$=([\s\S]+?)\$>/g;
    this.options.engine.options = {
        matcher: /<\$\$([^\$]+)\$>/g,
        detecter: /<\$\$?[^\$]+\$>/,
        start: '<$',
        end: '$>'
    };

    this.get = function (name) {
        if (!this.type) {
            throw new Error('cannot invoke `gen.get` before `gen.type` initialized');
        }

        var gen = require('./' + this.type);
        if (!gen) {
            throw new Error('invalid type: ' + this.type);
        }

        var method = gen[name] || function () {
            var done = slice.call(arguments, -1)[0];
            if (typeof done === 'function') done.call(this);
        };

        var args = slice.call(arguments, 1);
        args.unshift(this);
        debug('[%s] invoke %s\'s %s', name, this.type, name);
        return method.bind.apply(method, args);
    };
}

require('util').inherits(Generator, yeoman.generators.Base);
proto = Generator.prototype;

proto._getTemplate = function (callback) {
    var cacheTemplate = path.resolve(tmpPath, this.type),
        archive = 'https://codeload.github.com/scrat-team/scrat-template-' +
            this.type + '/tar.gz/master';
    callback = callback || function () {};

    if (this.options.clean) {
        debug('[getTemplate] clean cache template');
        rimraf.sync(cacheTemplate);
    }

    if (fs.existsSync(cacheTemplate)) {
        debug('[getTemplate] find cache template');
        return callback.call(this, null, cacheTemplate);
    }

    debug('[getTemplate] get template from %s', archive);
    this.extract(archive, cacheTemplate, function (err) {
        callback.call(this, err, cacheTemplate);
    });
};

proto.prepare = function () {
    var that = this,
        done = this.async(),
        prompts = [{
            type: 'input',
            name: 'name',
            message: 'Your project name',
            default : this.appname
        }, {
            type: 'input',
            name: 'version',
            message: 'Your project version',
            default : '1.0.0',
            validate: function (v) {
                return !!semver.valid(v);
            }
        }, {
            type: 'list',
            name: 'type',
            message: 'What type of scrat project to init?',
            choices: [{
                name: 'webapp',
                value: 'webapp'
            }, {
                name: 'seo',
                value: 'seo'
            }, {
                name: 'olpm',
                value: 'olpm'
            }]
        }];

    this.prompt(prompts, function (answers) {
        that.appname = answers.name;
        that.version = answers.version;
        that.type = answers.type;
        debug('[prepare] project type: %s', that.type);
        that.get('prepare')(function () {
            that._getTemplate(function (err, template) {
                if (err) return done(err);
                that.sourceRoot(template);
                done();
            });
        });
    });
};

proto.dotFiles = function () {
    debug('[dotFiles]');
    this.template('_gitignore', '.gitignore');
    this.template('_jshintrc', '.jshintrc');
    this.get('dotFiles')();
};

proto.meta = function () {
    debug('[meta]');
    this.template('_package.json', 'package.json');
    this.template('fis-conf.js');
    this.get('meta')();
};

proto.server = function () {
    debug('[server]');
    this.get('server')();
};

proto.views = function () {
    debug('[views]');
    var that = this;
    this.directory('views', function (content) {
        return that.engine(content, that);
    });
    this.get('views')(this.async());
};

proto.components = function () {
    debug('[components]');
    var that = this;
    this.directory('components', function (content) {
        return that.engine(content, that);
    });
    this.get('components')();
};

// proto.install = function () {
//     if (this.options.skipInstall) return;
//     debug('[install]');
//     this.get('install')(this.async());
// };

module.exports = Generator;