'use strict';

var expect = require('chai').expect;
var aliasr = require('../bin/aliasr');

describe('#aliasr', function() {
  it('should return true for a valid name', function() {
    var result = aliasr._validateName('test');
    expect(result).to.equal(true);
  });
  it('should return false for an invalid name', function() {
    var result = aliasr._validateName('te.st');
    expect(result).to.equal(false);
  });
});
