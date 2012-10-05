var Downstairs = require('../lib/downstairs')
  , Table = Downstairs.Table
  , should = require('should')
  , sql = require('sql')

Table.use(Downstairs);

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

describe('Table registration', function(){
  it('returns a Model (a constructor function), with a mappings property', function(){
    var User = Table.model(userSQL);
    should.exist(User);
    User.sql.should.equal(userSQL);
  });

  it('copies Table level behaviours onto the Model', function(){
    var User = Table.model(userSQL);
    should.exist(User.findAll);
  });

  it('does not copy the Table.model function onto the Model', function(){
    var User = Table.model(userSQL);
    should.not.exist(User.register);
  });

  it('keeps a registry of all model to table mappings via the node-sql Table definition', function(){
    var User = Table.model(userSQL);
    should.exist(Table.registry['users']);
  });
})