var util = require('util');

var Association = function(Model, configuration){
  this.Model = Model;
  this.eager = false;
  this.foreignKey = configuration.foreignKey;
  this.eager = (configuration.eager || false);
  this.name = configuration.as;

  this.isEager = function(){
    return this.eager;
  }
}

BelongsTo = function(){}();
HasOne = Association;
HasMany = Association;

BelongsTo.prototype.execute = function(association, cb){
  var args = {};
  args[this.foreignKey] = association.id;
  console.log(args);
  this.Model.find(args, cb);
};

exports.BelongsTo = BelongsTo;
exports.HasOne = HasOne;
exports.HasMany = HasMany;