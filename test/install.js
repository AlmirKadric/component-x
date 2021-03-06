var assert = require('assert');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var exists = fs.existsSync || path.existsSync;

describe('component install', function(){
  beforeEach(function(done){
    exec('rm -fr components component.json', done);
  })

  beforeEach(function(done){
    fs.writeFile('component.json', JSON.stringify({
      dependencies: {
        "component/tip": "*",
        "component/popover": "*"
      },
      development: {
        "component/assert": "*"
      }
    }), done);
  })

  describe('[name]', function(){
    it('should show an error message if the component is named incorrectly', function(done) {
      exec('bin/component install component-emitter', function(err, stdout) {
        err.message.should.containEql('invalid component name');
        done();
      })
    })

    it('should install a single component', function(done){
      exec('bin/component install component/emitter', function(err, stdout){
        if (err) return done(err);
        stdout.should.containEql('install');
        stdout.should.containEql('complete');
        var json = require(path.resolve('components/component-emitter/component.json'));
        json.name.should.equal('emitter');
        done();
      })
    })

    it('should add the component to ./component.json', function(done){
      exec('bin/component install component/emitter@0.0.4', function(err, stdout){
        if (err) return done(err);
        var json = require(path.resolve('component.json'));
        json.dependencies.should.have.property('component/emitter', '0.0.4');
        done();
      })
    })

    it('should install dependencies', function(done){
      exec('bin/component install component/overlay', function(err, stdout){
        if (err) return done(err);
        stdout.should.containEql('install');
        stdout.should.containEql('complete');
        var json = require(path.resolve('components/component-emitter/component.json'));
        json.name.should.equal('emitter');
        var json = require(path.resolve('components/component-overlay/component.json'));
        json.name.should.equal('overlay');
        done();
      })
    })

    it('should install dependencies through chain of local dependencies', function(done){
      exec('cd test/fixtures/local && ../../../bin/component install', function(err, stdout){
        if (err) return done(err);
        done();
      })
    })

    it('should download files completely', function(done){
      exec('bin/component install timoxley/font-awesome@3.2.1', function(err, stdout){
        if (err) return done(err);
        var stats = fs.statSync(path.resolve('components/timoxley-font-awesome/font/fontawesome-webfont.woff'));
        stats.size.should.equal(43572);
        stdout.should.containEql('install');
        stdout.should.containEql('complete');
        done();
      })
    })
  })

  describe('[name...]', function(){
    it('should install multiple components', function(done){
      exec('bin/component install component/overlay components/zepto', function(err, stdout){
        if (err) return done(err);
        stdout.should.containEql('install');
        stdout.should.containEql('complete');
        var json = require(path.resolve('components/component-emitter/component.json'));
        json.name.should.equal('emitter');
        var json = require(path.resolve('components/component-overlay/component.json'));
        json.name.should.equal('overlay');
        var json = require(path.resolve('components/components-zepto/component.json'));
        json.name.should.equal('zepto');
        done();
      })
    })
  })

  it('should default to installing from ./component.json', function(done){
    exec('bin/component install', function(err, stdout){
      if (err) return done(err);
      stdout.should.containEql('install');
      stdout.should.containEql('complete');
      var json = require(path.resolve('components/component-emitter/component.json'));
      json.name.should.equal('emitter');
      var json = require(path.resolve('components/component-tip/component.json'));
      json.name.should.equal('tip');
      var json = require(path.resolve('components/component-popover/component.json'));
      json.name.should.equal('popover');
      assert(!exists('components/component-assert'), 'dev deps should not be installed');
      done();
    })
  })

  it('should install dev deps when --dev is used', function(done){
    exec('bin/component install -d', function(err, stdout){
      if (err) return done(err);
      stdout.should.containEql('install');
      stdout.should.containEql('complete');
      var json = require(path.resolve('components/component-emitter/component.json'));
      json.name.should.equal('emitter');
      var json = require(path.resolve('components/component-tip/component.json'));
      json.name.should.equal('tip');
      var json = require(path.resolve('components/component-popover/component.json'));
      json.name.should.equal('popover');
      assert(exists('components/component-assert'), 'dev deps should be installed');
      done();
    })
  })

  it('should be aliased as "add"', function(done){
    exec('bin/component add component/emitter', function(err, stdout){
      if (err) return done(err);
      stdout.should.containEql('install');
      stdout.should.containEql('complete');
      var json = require(path.resolve('components/component-emitter/component.json'));
      json.name.should.equal('emitter');
      done();
    })
  })
})
