'use strict';

exports.meta = function (callback) {
    this.template('_component.json', 'component.json');
};

exports.views = function (done) {
    this.fetch([
        'https://raw.githubusercontent.com/scrat-team/scrat.js/master/scrat.js',
        'https://raw.githubusercontent.com/necolas/normalize.css/master/normalize.css'
    ], 'views/lib', function (err) {
        if (err) return done(err);
        done();
    });
};

exports.server = function () {
    var that = this;
    this.directory('server', function (content) {
        return that.engine(content, that);
    });
    this.template('Procfile');
};

exports.install = function (done) {
    this.npmInstall([
        'express',
        'compression',
        'errorhandler',
        'http-proxy'
    ], {save: true}, done);
};