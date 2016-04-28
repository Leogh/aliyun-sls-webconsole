/**
 * Created by roman on 4/28/16.
 */
define(function () {

  var Base = function Base () {
    this.__super = this;

    this._id = null;
    this._status = null;
    this._methods = {
      _fromModel: function () {

      },
      _toModel: function () {

      }
    };

  };

  Base.prototype = {
    toModel: toModel,
    fromModel: fromModel,
    validate: validate,
  };

  return Base;

  function toModel() {
    // need to override
    return {
      _id: this._id,
      status: this._status,
    };
  }

  function fromModel(model) {
    // need to override
    this._id = model._id;
    this._status = model.status;
  }

  function validate() {
    // need to override
    return true;
  }
});