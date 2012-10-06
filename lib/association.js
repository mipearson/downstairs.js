var util = require('util');

var Association = function(Model, configuration){
  this.Model = Model;

  if (configuration){
    this.eager = false;
    this.foreignKey = configuration.foreignKey;
    this.eager = (configuration.eager || false);
  } else {
    this.eager = false;
  }


  this.isEager = function(){
    return this.eager;
  }
}

BelongsTo = Association;
HasOne = Association;
HasMany = Association;

BelongsTo.prototype.execute = function(association){
  console.log(this, " <<<< the Model, right?");
  var args = {};
  args[this.foreignKey] = association.id;
  console.log(args);
  this.Model.find(args);
};

exports.BelongsTo = BelongsTo;
exports.HasOne = HasOne;
exports.HasMany = HasMany;