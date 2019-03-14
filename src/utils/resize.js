/* eslint-disable no-console */
const sharp = require('sharp');
const request = require('request');

// get path of image, its format and desired width
module.exports = function resize(path, width) {
	const readStream = request({url:path,encoding:null});
	let transform = sharp();

	transform = transform.resize(width);
	transform = transform.toFormat('jpeg');

	transform
		.on('error', function(err) {
			console.log('Exception: ' + err);
		});

	return readStream.pipe(transform);
};
