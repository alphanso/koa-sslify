var expect = require('chai').expect;
var koa = require('koa');
var agent = require('supertest-koa-agent');
var enforce = require('../index.js');

describe('Heroku-style proxy SSL flag', function() {

  describe('Flag is not set', function() {
    var app = koa();

    app.use(enforce());

    app.use(function * (next) {
      this.response.status = 200;
      yield next;
    });

    var subject = agent(app);

    it('should ignore x-forwarded-proto if not activated', function (done) {
      subject
        .get('/ssl')
          .set('x-forwarded-proto', 'https')
        .expect(301)
        .expect('location', new RegExp('^https://[\\S]*/ssl$'), done);
    });

  });

  describe('Flag is set', function() {
    var app = koa();

    app.use(enforce({ trustProtoHeader: true }));

    app.use(function * (next) {
      this.response.status = 200;
      yield next;
    });

    var subject = agent(app);

    it('should accept request if flag set and activated', function (done) {
      subject
        .get('/ssl')
          .set('x-forwarded-proto', 'https')
        .expect(200, 'OK', done);
    });

    it('should redirect if activated but flag not set', function (done) {
      subject
        .get('/ssl')
        .expect(301)
        .expect('location', new RegExp('^https://[\\S]*/ssl$'), done);
    });

    it('should redirect if activated but wrong flag set', function (done) {
      subject
        .get('/ssl')
          .set('x-arr-ssl', 'https')
        .expect(301)
        .expect('location', new RegExp('^https://[\\S]*/ssl$'), done);
    });
  });
});
