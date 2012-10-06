var Downstairs = require('../lib/downstairs.js')
  , should = require('should')
  , sql = require('sql')
  , env = require('./../config/env')
  , helper = require('./helper')
  , ectypes = helper.ectypes
  , Table = Downstairs.Table;

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
  micename character varying(100) unique NOT NULL,\
  created_at timestamp with time zone NOT NULL DEFAULT now(),\
  updated_at timestamp with time zone NOT NULL DEFAULT now(),\
  CONSTRAINT pk_mice PRIMARY KEY (id)\
);";

var catSchema = sql.Table.define({
      name: 'cats'
      , quote: true
      , columns: ['id' 
        , 'catname' 
        , 'created_at'
        , 'updated_at'
      ]
    });

var catTableSQL = "CREATE TABLE cats\
(\
  id bigserial NOT NULL,\
  name character varying(100) unique NOT NULL,\
  created_at timestamp with time zone NOT NULL DEFAULT now(),\
  updated_at timestamp with time zone NOT NULL DEFAULT now(),\
  CONSTRAINT pk_cats PRIMARY KEY (id)\
);";

var Cat = Table.model(catSchema);

Cheese.belongsTo(Mouse, {foreignKey: 'mouse_id', eager: true});
Mouse.hasOne(Cheese);
Mouse.belongsTo(Cat, {foreignKey: 'cat_id'});
Cat.hasMany(Mouse);

var associationsBlueprint =
  {
    Cheese: { 
      name: function(){ return faker2.Internet.email() } 
    }
    , Mouse: { 
      name: function(){ return faker2.Internet.email() } 
    }
    , Cat: { 
      name: function(){ return faker2.Internet.email() } 
    } 
}

describe('setting up associations', function(){
  var cheese, mouse1, mouse2, cat;

  beforeEach(function(done){
    helper.resetDb(mouseSQL + catTableSQL + cheeseSQL, done);
  })

  beforeEach(function(done){
    ectypes.Cheese.create(function(err, cheese){
      cheese = cheese;
    })
  })

  it('finds an associated model via belongsTo', function(done){
    console.log(cheese, " <<< cheese");
    
  })

});





