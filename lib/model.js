var Model = function(properties){
  this.properties = properties;
  this._isNew = true;
  this._isDirty = false;
  this.sql = sql;
  this.modelName = name;

  for (var prop in properties){
    this[prop] = properties[prop];
  }

  if (this.id) { this._isNew = false; }
  this.validations = validations;

  var validationCycle = [];

  for (var validation in this.validations){
    this[validation] = this.validations[validation];

    var _self = this;
    validationCycle.push(createValidator(this, validation));
  }

  this.isValid = function(cb){
    if (typeof this.validations === 'undefined'){
      cb("Define validations on the model first.", null);
    }

    async.parallel(validationCycle, function(err, results){
      var validationErrors = _.filter(results, function(result){ return result != null});
      if (validationErrors.length == 0){ 
        validationErrors = null 
      }

      cb(validationErrors, validationErrors == null);
    });
  }

  // this.destroy = function(cb) {}

  // this.save = function(cb) {}

  //an interim step for reaching a JSON representation of the model
  this.toJson = function(options) {
    var returnJson = this.properties;
    return returnJson;
  }

};

module.exports = Model;