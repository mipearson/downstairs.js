var Collection = {}
  , async = require('async')
  , _ = require('underscore')
  , Record = require('./record')
  , lingo = require('lingo')
  , fleck = require('fleck');

Collection.use = function(Downstairs){
  Collection.Downstairs = Downstairs;
}

/*
 * Custom callbacks
 */
Collection.when = function(callbackName, callback){
  this.callbacks[callbackName] = callback;
}

Collection.runModelCallbacks = function(modelCallbacks, data, cb){
  var record = this;

  var caller = function(invocation, _cb){
    if (typeof invocation === "string"){
      record.callbacks[invocation](data, _cb);
    }
    else { //we assume it's an object matching {name: 'callbackName', args: [...]}
      invocation.args.push(_cb);
      var func = record.callbacks[invocation.name].bind(null, data);
      func.apply(null, invocation.args);
    }
  }

  async.forEach(modelCallbacks, caller, function(err){
    return cb(err, data);
  });
}

/*
 * Eventing
 */

Collection.on = function(eventName, whenFunction){
  this.prototype.on(eventName, whenFunction);
}

Collection.emitQueryEvents = function(queryEvents, data){
  var record = this;

  var eventEmitter = function(eventName){
    record.prototype.emit(eventName, data);
  }

  async.forEach(queryEvents, eventEmitter);
}

/**
 ** Database behaviours. These functions are copied onto the Model (a constructor function).
 ** So, Collection level behaviours can be used to produce Record level results.
 **
 ** Each of these functions applies the adapter function onto the Model.
 **/
Collection.findAll = function(conditions, cb){
  this.configuration.adapter.findAll.apply(this, arguments);
};

Collection.find = function(conditions, cb){
  this.configuration.adapter.find.apply(this, arguments);
};

Collection.update = function(data, conditions, cb){
  this.configuration.adapter.update.apply(this, arguments);
}

Collection.create = function(data, cb){
  this.configuration.adapter.create.apply(this, arguments);
}

Collection.delete = function(data, cb) {
  this.configuration.adapter.delete.apply(this, arguments);
}

Collection.count = function(conditions, cb){
  this.configuration.adapter.count.apply(this, arguments);
};

Collection.max = function(conditions, cb){
  this.configuration.adapter.max.apply(this, arguments);
};

Collection.getConnection = function(){
  return this.configuration.connection;
}


/*
 * Associations.
 */

Collection.belongsTo = function(model){
  var belongsToAssociationName = fleck.underscore(model._name);
  var foreignKeyName = belongsToAssociationName + "_id"; //oneday this will be configurable

  var belongsTo = function(cb){
    var record = this;
    model.find({id: this[foreignKeyName]}, function(err, belonger){
      record[belongsToAssociationName] = belonger;
      cb(err, belonger);
    });
  };

  this.prototype['_' + belongsToAssociationName] = belongsTo;
  this.prototype[belongsToAssociationName] = null;
}

Collection.hasOne = function(model){
  var keyName = fleck.underscore(this._name);
  var hasOneAssociationName = fleck.underscore(model._name);
  var foreignKeyName =  keyName + "_id"; //oneday this will be configurable

  var hasOne = function(cb){
    var record = this;
    var query = {};
    query[foreignKeyName] = record.id;
    model.find(query, function(err, one){
      record[hasOneAssociationName] = one;
      cb(err, one);
    });
  };

  this.prototype['_' + hasOneAssociationName] = hasOne;
  this.prototype[hasOneAssociationName] = null;
}

Collection.hasMany = function(model){
  var keyName = fleck.underscore(this._name);
  keyName = keyName.toLowerCase();
  var hasManyAssociationName = lingo.en.pluralize(fleck.underscore(model._name));
  var foreignKeyName =  keyName + "_id"; //oneday this will be configurable

  var hasMany = function(cb){
    var record = this;
    var query = {};
    query[foreignKeyName] = record.id;
    model.findAll(query, function(err, all){
      record[hasManyAssociationName] = all;
      cb(err, all);
    });
  };

  this.prototype['_' + hasManyAssociationName] = hasMany;
  this.prototype[hasManyAssociationName] = [];
}

var mixinCollectionFunctions = function(obj){
  for (var property in Collection){
    if (property === "model"){ continue }

    if (typeof Collection[property] === 'function'){
      obj[property] = Collection[property];
    }
  }
}

var createValidator = function(model, validationName){
  return function(cb){
    model[validationName](cb);
  }
};

/*
 * The model function creates a Model constructor function
 * & copies all Collection level behaviours onto the Model
 * & copies the node-sql object onto the Model.
 */
Collection.model = function(name, sql, validations, configurationName){
  var configuration;

  if (configurationName){
    configuration = Collection.Downstairs.get(configurationName);
  } else {
    configuration = Collection.Downstairs.get('default');
  }

  /*
   * Model constructor function. Holds all behaviour for the Collection
   * that must apply to each Record belonging to it (validation, etc.)
   */
  var Model = function(properties){
    this.properties = properties;
    var validationCycle = [];
    var record = this;

    for (var prop in properties){
      this[prop] = this.properties[prop];
    }

    for (var validation in this.validations){
      this[validation] = this.validations[validation];
      var self = this;
      validationCycle.push(createValidator(record, validation));
    }

    this.isValid = function(cb){
      if (typeof this.validations === 'undefined'){
        return cb(null, true);
      }

      async.parallel(validationCycle, function(err, results){
        var validationErrors = _.filter(results, function(result){ return result != null});
        if (validationErrors.length == 0){
          validationErrors = null
        }

        cb(validationErrors, validationErrors == null);
      });
    }

    this.get = function(associationName, cb){
      return this['_' + associationName](cb);
    }
  };

  Model._name =  name;

  Model.prototype = new Record();
  Model.prototype.constructor = Record;

  Model.configuration = configuration;
  Model.sql = sql;
  Model.Downstairs = Collection.Downstairs;
  Model.prototype.validations = validations;
  Model.prototype._model = Model;
  Model.callbacks = {};

  mixinCollectionFunctions(Model);

  if (!configuration){
    throw new Error('There is no connection defined. Make sure you have called Downstairs.add(connection)');
  }
  else {
    configuration.register(name, Model);
  }
  return Model;
}

module.exports = Collection;