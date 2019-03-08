var exports = module.exports = {};

// find number of days between two dates
exports.daysDifference = function (startdate, enddate) {
	let d1 = new Date(startdate);
	let d2 = new Date(enddate);

	return Math.round(Math.abs((d1.getTime() - d2.getTime()) / (24*60*60*1000)));
};

// get date from string
exports.getDate = function (date) {
	let d = new Date(date);
	d.setDate(d.getDate());
	let month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;

	return [year.toString(), month, day].join('');
};

// subtract x number of days from date string
exports.subtractDate = function (date, subtract) {
	let d = new Date(date);
	d.setDate(d.getDate() - subtract);
	let month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;

	return [year, month, day].join('-');
};

// get date from URL
exports.getDateFromURL = function (date) {
	if (parseInt(date.substring(0, 2)) >= 95) {
		date = '19' + date;
	} else {
		date = '20' + date;
	}

	let year = date.slice(0, 4);
	let month = date.slice(4, 6);
	let day = date.slice(6, 8);

	return [year, month, day].join('-');
};
