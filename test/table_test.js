var Downstairs = require('../lib/downstairs')
  , Table = Downstairs.Table
  , should = require('should')
  , sql = require('sql')
  , Connection = require('../lib/connections/connection')
  , helper = require('./helper')
  , ectypes = helper.ectypes
  , env = require('./../config/env');

//Table.use(Downstairs);

var pgConnection = new Downstairs.Connection.PostgreSQL(env.connectionString);
Downstairs.add(pgConnection);

var userSQL = sql.Table.define({
  name: 'users'
  , quote: true
  , columns: ['id' 
    , 'username' 
    , 'created_at'
    , 'updated_at'
    , 'is_active'
    , 'email'
    , 'password'
  ]
});

var roleSQL = sql.Table.define({
  name: 'roles'
  , quote: true
  , columns: ['id' 
    , 'name' 
  ]
});


describe('Tables creating Model constructors', function(){
  it('returns a Model (a constructor function), with a mappings property', function(){
    var User = Table.model('User', userSQL);
    should.exist(User);
    User.sql.should.equal(userSQL);
  });

  it('copies Table level behaviours onto the Model', function(){
    var User = Table.model('User', userSQL);
    should.exist(User.findAll);
  });

  it('does not copy the Table.model function onto the Model', function(){
    var User = Table.model('User', userSQL);
    should.not.exist(User.register);
  });

  it('does not confuse sql objects when multiple models are declared', function(){
    var User = Table.model('User', userSQL);
    var Role = Table.model('Role', roleSQL);   
    User.sql.should.equal(userSQL);
    Role.sql.should.equal(roleSQL); 
  });
});

describe('Table level behaviours', function() {
  beforeEach(function(done){
     helper.resetDb(helper.userTableSQL, done);
  })

  it('finds a record with a where JSON condition', function(done) {
    var User = Table.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.find({username: 'fred', email: 'fred@moneytribe.com.au'} , function(err, user){
        should.exist(user);
        user.username.should.equal('fred');
        done();
      });
    });
  });

  it('updates a record with JSON condition', function(done){
    var User = Table.model('User', userSQL);
    var data = {password: '5f4dcc3b5aa765d61d8327deb882cf99', username: 'fred', email: 'fred@moneytribe.com.au'};
    ectypes.User.create(data, function(err, results) {

      User.update({username: 'fredUpdated'}, {email: 'fred@moneytribe.com.au'}, function(err, result){
        should.not.exist(err);
        result.should.be.ok;
        done();
      });
    })
  })
});
