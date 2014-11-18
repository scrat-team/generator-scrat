'use strict';

exports.views = function (done) {
  this.fetch([
    'https://raw.githubusercontent.com/scrat-team/md.js/master/md.js',
    'https://raw.githubusercontent.com/scrat-team/pagelet.js/master/pagelet.js',
    'https://raw.githubusercontent.com/necolas/normalize.css/master/normalize.css'
  ], 'views/lib', function (err) {
    if (err) return done(err);
    done();
  });
};