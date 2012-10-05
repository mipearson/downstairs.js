var util = require('util');

var Association = function(){
  this.eager = false;
}


BelongsTo = function(Model, configuration){
};

HasOne = function(Model, configuration){
};

HasMany = function(Model, configuration){
};

util.inherits(BelongsTo, Association);
util.inherits(HasOne, Association);
util.inherits(HasMany, Association);

exports.BelongsTo = BelongsTo;
exports.HasOne = HasOne;
exports.HasMany = HasMany;