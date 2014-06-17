'use strict';

var debug = require('debug')('scrat:init:generator'),
    yeoman = require('yeoman-generator'),
    semver = require('semver'),
    rimraf = require('rimraf'),
    path = require('path'),
    fs = require('fs'),
    tmpPath = fis.project.getTempPath('init'),
    proto;

function getTemplateUrl(type, ref) {
    ref = ref || 'master';
    return 'https://codeload.github.com/scrat-team/scrat-template-' +
        type + '/tar.gz/' + ref;
}

function getTemplate() {
    var gen = this,
        type, clean, callback, cacheTemplate;
    Array.prototype.slice.call(arguments).forEach(function (arg) {
        switch (typeof arg) {
        case 'object':
            gen = arg;
            break;
        case 'string':
            type = arg;
            break;
        case 'boolean':
            clean = arg;
            break;
        case 'function':
            callback = arg;
            break;
        }
    });
    type = type || 'webapp';
    clean = clean === true;
    callback = callback || function () {};
    cacheTemplate = path.resolve(tmpPath, type);

    if (clean) {
        debug('[getTemplate] clean cache template');
        rimraf.sync(cacheTemplate);
    }

    if (fs.existsSync(cacheTemplate)) {
        debug('[getTemplate] find cache template');
        return callback.call(gen, null, cacheTemplate);
    }

    debug('[getTemplate] get template from %s', getTemplateUrl(type));
    gen.extract(getTemplateUrl(type), cacheTemplate, function (err) {
        callback.call(gen, err, cacheTemplate);
    });
}

function Generator(args, options) {
    yeoman.generators.Base.apply(this, arguments);
}

require('util').inherits(Generator, yeoman.generators.Base);
proto = Generator.prototype;

proto.prepare = function () {
    var done = this.async(),
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
            // }, {
            //     name: 'olpm',
            //     value: 'olpm'
            }]
        }];

    this.prompt(prompts, function (answers) {
        this.appname = answers.name;
        this.version = answers.version;
        this.type = answers.type;

        getTemplate(this, this.type, this.options.clean, function (err, template) {
            if (err) return done(err);
            this.sourceRoot(template);
            done();
        });
    }.bind(this));
};

proto.dotFiles = function () {
    this.template('_gitignore', '.gitignore');
    this.template('_jshintrc', '.jshintrc');
};

proto.meta = function () {
    this.template('_package.json', 'package.json');
    this.template('_component.json', 'component.json');
    this.template('fis-conf.js');
};

proto.views = function () {
    var that = this,
        done = this.async();
    this.directory('views', function (content) {
        return that.engine(content, that);
    });
    this.fetch([
        'https://raw.githubusercontent.com/scrat-team/scrat.js/master/scrat.js',
        'https://raw.githubusercontent.com/necolas/normalize.css/master/normalize.css'
    ], 'views/lib', function (err) {
        if (err) return done(err);
        done();
    });
};

proto.server = function () {
    var that = this;
    this.directory('server', function (content) {
        return that.engine(content, that);
    });
    this.template('Procfile');
};

proto.components = function () {
    var that = this;
    this.directory('components', function (content) {
        return that.engine(content, that);
    });
};

proto.install = function () {
    if (this.options.skipInstall) return;
    var done = this.async();
    this.npmInstall([
        'express',
        'compression',
        'errorhandler',
        'http-proxy'
    ], {save: true}, done);
};

module.exports = Generator;