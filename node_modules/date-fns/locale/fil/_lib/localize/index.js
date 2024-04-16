"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = _interopRequireDefault(require("../../../_lib/buildLocalizeFn/index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var eraValues = {
  narrow: ['B', 'A'],
  abbreviated: ['BC', 'AD'],
  wide: ['Before Christ', 'Anno Domini']
};
var quarterValues = {
  narrow: ['1', '2', '3', '4'],
  abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
  wide: ['Unang sangkapat', 'Ikalawang sangkapat', 'Ikatlong sangkapat', 'Ikaapat sangkapat']
}; // Note: in English, the names of days of the week and months are capitalized.
// If you are making a new locale based on this one, check if the same is true for the language you're working on.
// Generally, formatted dates should look like they are in the middle of a sentence,
// e.g. in Spanish language the weekdays and months should be in the lowercase.

var monthValues = {
  narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  abbreviated: ['Enero', 'Peb', 'Marso', 'Abr', 'Mayo', 'Hun', 'Hul', 'Agosto', 'Set', 'Okt', 'Nob', 'Dis'],
  wide: ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre']
};
var dayValues = {
  narrow: ['L', 'L', 'M', 'M', 'H', 'B', 'S'],
  short: ['Li', 'Lu', 'Ma', 'Mi', 'Hu', 'Bi', 'Sa'],
  abbreviated: ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'],
  wide: ['Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado']
};
var dayPeriodValues = {
  narrow: {
    am: 'a',
    pm: 'p',
    midnight: 'mi',
    noon: 'n',
    morning: 'umaga',
    afternoon: 'hapon',
    evening: 'gabi',
    night: 'gabi'
  },
  abbreviated: {
    am: 'AM',
    pm: 'PM',
    midnight: 'hatinggabi',
    noon: 'tanghali',
    morning: 'umaga',
    afternoon: 'hapon',
    evening: 'gabi',
    night: 'gabi'
  },
  wide: {
    am: 'a.m.',
    pm: 'p.m.',
    midnight: 'hatinggabi',
    noon: 'tanghali',
    morning: 'umaga',
    afternoon: 'hapon',
    evening: 'gabi',
    night: 'gabi'
  }
};
var formattingDayPeriodValues = {
  narrow: {
    am: 'a',
    pm: 'p',
    midnight: 'mi',
    noon: 'n',
    morning: 'sa umaga',
    afternoon: 'sa hapon',
    evening: 'sa gabi',
    night: 'sa gabi'
  },
  abbreviated: {
    am: 'AM',
    pm: 'PM',
    midnight: 'midnight',
    noon: 'noon',
    morning: 'sa umaga',
    afternoon: 'sa hapon',
    evening: 'sa gabi',
    night: 'sa gabi'
  },
  wide: {
    am: 'a.m.',
    pm: 'p.m.',
    midnight: 'midnight',
    noon: 'noon',
    morning: 'sa umaga',
    afternoon: 'sa hapon',
    evening: 'sa gabi',
    night: 'sa gabi'
  }
};

var ordinalNumber = function ordinalNumber(dirtyNumber, _options) {
  var number = Number(dirtyNumber); // If ordinal numbers depend on context, for example,
  // if they are different for different grammatical genders,
  // use `options.unit`.
  //
  // `unit` can be 'year', 'quarter', 'month', 'week', 'date', 'dayOfYear',
  // 'day', 'hour', 'minute', 'second'.
  // const rem100 = number % 100
  // if (rem100 > 20 || rem100 < 10) {
  //   switch (rem100 % 10) {
  //     case 1:
  //       return number + 'st'
  //     case 2:
  //       return number + 'nd'
  //     case 3:
  //       return number + 'rd'
  //   }
  // }

  return 'ika-' + number;
};

var localize = {
  ordinalNumber: ordinalNumber,
  era: (0, _index.default)({
    values: eraValues,
    defaultWidth: 'wide'
  }),
  quarter: (0, _index.default)({
    values: quarterValues,
    defaultWidth: 'wide',
    argumentCallback: function argumentCallback(quarter) {
      return quarter - 1;
    }
  }),
  month: (0, _index.default)({
    values: monthValues,
    defaultWidth: 'wide'
  }),
  day: (0, _index.default)({
    values: dayValues,
    defaultWidth: 'wide'
  }),
  dayPeriod: (0, _index.default)({
    values: dayPeriodValues,
    defaultWidth: 'wide',
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: 'wide'
  })
};
var _default = localize;
exports.default = _default;
module.exports = exports.default;