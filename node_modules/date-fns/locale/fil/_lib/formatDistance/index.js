"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var formatDistanceLocale = {
  lessThanXSeconds: {
    one: 'wala pang isang segundo',
    other: 'wala pang {{count}} na segundo'
  },
  xSeconds: {
    one: 'isang segundo',
    other: '{{count}} segundo'
  },
  halfAMinute: 'kalahating minuto',
  lessThanXMinutes: {
    one: 'wala pang isang minuto',
    other: 'wala pang {{count}} na minuto'
  },
  xMinutes: {
    one: 'isang minuto',
    other: '{{count}} minuto'
  },
  aboutXHours: {
    one: 'mga isang oras',
    other: 'mga {{count}} na oras'
  },
  xHours: {
    one: 'isang oras',
    other: '{{count}} na oras'
  },
  xDays: {
    one: 'isang araw',
    other: '{{count}} na araw'
  },
  aboutXWeeks: {
    one: 'mga isang linggo',
    other: 'mga {{count}} na linggo'
  },
  xWeeks: {
    one: 'isang linggo',
    other: '{{count}} na linggo'
  },
  aboutXMonths: {
    one: 'mga isang buwan',
    other: 'mga {{count}} na buwan'
  },
  xMonths: {
    one: 'isang buwan',
    other: '{{count}} na buwan'
  },
  aboutXYears: {
    one: 'mga isang taon',
    other: 'mga {{count}} na taon'
  },
  xYears: {
    one: 'isang taon',
    other: '{{count}} na taon'
  },
  overXYears: {
    one: 'mahigit isang taon',
    other: 'mahigit {{count}} na taon'
  },
  almostXYears: {
    one: 'halos isang taon',
    other: 'halos {{count}} na taon'
  }
};

var formatDistance = function formatDistance(token, count, options) {
  var result;
  var tokenValue = formatDistanceLocale[token];

  if (typeof tokenValue === 'string') {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace('{{count}}', count.toString());
  }

  if (options !== null && options !== void 0 && options.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return 'sa ' + result;
    } else {
      return result + ' nakaraan';
    }
  }

  return result;
};

var _default = formatDistance;
exports.default = _default;
module.exports = exports.default;