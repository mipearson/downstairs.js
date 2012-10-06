var Downstairs = require('../lib/downstairs.js')
  , Connection = Downstairs.Connection
  , should = require('should')
  , sql = require('sql')
  , env = require('./../config/env')
  , helper = require('./helper')
  , ectypes = helper.ectypes
  , Table = Downstairs.Table
  , faker2 = require('faker2');

helper.resetConnection();

var cheeseSchema = sql.Table.define({
      name: 'cheeses'
      , quote: true
      , columns: ['id' 
        , 'name' 
        , 'created_at'
        , 'updated_at'
      ]
    });

var cheeseSQL = "CREATE TABLE cheeses\
(\
  id bigserial NOT NULL,\
  name character varying(100) unique NOT NULL,\
  mouse_id bigserial NOT NULL,\
  created_at timestamp with time zone NOT NULL DEFAULT now(),\
  updated_at timestamp with time zone NOT NULL DEFAULT now(),\
  CONSTRAINT pk_cheeses PRIMARY KEY (id)\
);";

var Cheese = Table.model(cheeseSchema);

var mouseSchema = sql.Table.define({
      name: 'mice'
      , quote: true
      , columns: ['id' 
        , 'name' 
        , 'created_at'
        , 'updated_at'
      ]
    });

var Mouse = Table.model(mouseSchema);
var mouseSQL = "CREATE TABLE mice\
(\
  id bigserial NOT NULL,\
  cat_id bigserial NOT NULL,\
  name character varying(100) unique NOT NULL,\
  created_at timestamp with time zone NOT NULL DEFAULT now(),\
  updated_at timestamp with time zone NOT NULL DEFAULT now(),\
  CONSTRAINT pk_mice PRIMARY KEY (id)\
);";

var catSchema = sql.Table.define({
      name: 'cats'
      , quote: true
      , columns: ['id' 
        , 'name' 
        , 'created_at'
        , 'updated_at'
      ]
    });

var catSQL = "CREATE TABLE cats\
(\
  id bigserial NOT NULL,\
  name character varying(100) unique NOT NULL,\
  created_at timestamp with time zone NOT NULL DEFAULT now(),\
  updated_at timestamp with time zone NOT NULL DEFAULT now(),\
  CONSTRAINT pk_cats PRIMARY KEY (id)\
);";

var Cat = Table.model(catSchema);

Cheese.belongsTo(Mouse, {foreignKey: 'mouse_id', as: 'cheese', eager: true});
Mouse.hasOne(Cheese, {as: 'mouse'});
Mouse.belongsTo(Cat, {foreignKey: 'cat_id', as: 'cat'});
Cat.hasMany(Mouse, {as: 'mice'});

var associationsBlueprint = [
  {Cheese: { 
      name: function(){ return faker2.Lorem.words(2).join(' ') } 
    }}
    , {Mouse: { 
      name: function(){ return faker2.Lorem.words(2).join(' ') } 
    }}
    , {Cat: { 
      name: function(){ return faker2.Lorem.words(2).join(' ') } 
    }}]

ectypes.add(associationsBlueprint);

describe('setting up associations', function(){
  beforeEach(function(done){
    helper.resetDb(mouseSQL + catSQL + cheeseSQL, done);
  })

  beforeEach(function(done){
    ectypes.Cat.create(function(err, result){
      ectypes.Mouse.create(function(err, result){
        ectypes.Cheese.create(function(err, result){
          done();
        })
      })
    })
  })

  // beforeEach(function(done){
  //   var cheese, mouse1, mouse2, cat;
  //   Cat.findAll(function(err, cats){
  //     cat = cats[0];
  //     done();
  //   })
  // })

  it('finds an associated model via belongsTo', function(done){
    Cheese.findAll(function(err, cheeses){
      var cheese = cheeses[0];
      console.log(cheese, " <<< cheese");
      should.exist(cheese.mouse);
      done();
    })
  })

});