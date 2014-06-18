'use strict';

exports.prepare = function (done) {
    var that = this,
        prompts = [{
            type: 'input',
            name: 'code',
            message: 'OLPM CODE',
            validate: function (v) {
                return v && v.length > 0;
            }
        }];

    this.prompt(prompts, function (answers) {
        that.code = answers.code;
        done();
    });
};

exports.views = function (done) {
    this.fetch([
        'https://raw.githubusercontent.com/fouber/md.js/master/md.js'
    ], 'views/lib', function (err) {
        if (err) return done(err);
        done();
    });
};

exports.server = function () {
    this.template('index.js');
};

exports.install = function (done) {
    this.npmInstall([
        'express',
        'request'
    ], {save: true}, done);
};