/**
 * Created by Roman Lo on 5/19/2016.
 */

define(function () {

  var PeriodUnit = periodUnitFilter.PeriodUnit = {
    Minute: 1,
    Hour: 2,
    Day: 3,
    Week: 4,
    Month: 5
  };

  return periodUnitFilter;

  function periodUnitFilter() {
    return function (unit) {
      var raw = unit;
      if(!isNaN(unit)) {
        unit = parseInt(unit);
        switch(unit) {
          case PeriodUnit.Minute: return 'minute';
          case PeriodUnit.Hour: return 'hour';
          case PeriodUnit.Day: return 'day';
          case PeriodUnit.Week: return 'week';
          case PeriodUnit.Month: return 'month';
          default:
            return raw;
        }
      } else {
        return raw;
      }
    };
  };
});
