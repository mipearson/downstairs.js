var Connection = require('./../../lib/connections')
  , should = require('should')
  , env = require('./../../config/env')
  , helper = require('./../helper')
  , Table = require('./../../lib/table');

var myDefaultPGConnection;

describe('Connections, assuming that the downstairs_test db exists', function(){

  beforeEach(function() {
    myDefaultPGConnection = new Connection.PostgreSQL(env.connectionString);
  });

  it('can create a default connection object', function() {
    should.exist(myDefaultPGConnection);
  });

  it('can execute a query', function(done){
    var queryString = "select version()";

    myDefaultPGConnection.query(queryString, function(err, result){
      should.not.exist(err);
      should.exist(result);
      should.exist(result.rows[0].version);
      result.rows[0].version.should.be.a('string');
      done();
    })
  });

  it('has a registry of Models', function(done) {
    var userSQL = helper.userSQL;
    var User = Table.model('User', userSQL);

    should.exist(myDefaultPGConnection.modelConstructorRegistry);
    should.exist(myDefaultPGConnection.modelConstructorRegistry.User);
  });
});


// describe('Downstairs', function(){
//   beforeEach(function(done){
//     var fooSQL = "CREATE TABLE foo (id int, name character varying(50));"
//     helper.resetDb(fooSQL, done);
//   })

//   it('can connect to the database', function(done) {
//     Downstairs.go(env.connectionString);
//     Downstairs.query('SELECT * FROM foo;', function(err, results) {
//       should.exist(results);
//       done();
//     })
//   });
// });
