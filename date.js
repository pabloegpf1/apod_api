var exports = module.exports = {};

// find number of days between two dates
exports.daysDifference = function (startdate, enddate) {
  var d1 = new Date(startdate);
  var d2 = new Date(enddate);

  return Math.round(Math.abs((d1.getTime() - d2.getTime()) / (24*60*60*1000)));
};

// get date from string
exports.getDate = function (date) {
  var d = new Date(date);
  d.setDate(d.getDate());
  month = '' + (d.getMonth() + 1),
  day = '' + d.getDate(),
  year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year.toString(), month, day].join("");
};

// subtract x number of days from date string
exports.subtractDate = function (date, subtract) {
  var d = new Date(date);
  d.setDate(d.getDate() - subtract);
  month = '' + (d.getMonth() + 1),
  day = '' + d.getDate(),
  year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};
