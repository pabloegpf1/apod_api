const dates = require('./date.js');
const loader = require('./loader.js');
const request = require('request');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
var encoding = 'windows-1252';
var exports = module.exports = {};

exports.find = async function (body, query, html_tags, thumbs, image_thumbnail_size, api_url, multiple_thumbs, absolute_img_thumb_url, number, page) {
  var return_data = new Promise(async function(resolve, reject) {
    var days;
    var i = 1;

    if (number !== undefined) {
      if (number > 200) {
        number = 200;
      }
      if (page !== undefined) {
        i = (page - 1) * number + 1;
      } else {
        page = 1;
      }
      days = number * page;
    } else {
      days = (body("img").length);
    }
    var array = [];
    var data;

    if (days > 0) {
      var array = [];
      for (i; (number !== undefined && page !== undefined) ? (i <= days) : (i < days); i++) {
        (async function(i) {
          array.push(new Promise(function(resolve, reject) {
            if (body("img").eq(i).parent().attr("href") === null || body("img").eq(i).parent().attr("href") === undefined) {
              var date = {};
              resolve(date);
            } else {
              var date = dates.getDateFromURL(body("img").eq(i).parent().attr("href").match(/[0-9]{6}/gm)[0]);
              resolve(date);
            }
          }));
        })(i);
        data = await Promise.all(array);
      }

      getAPODs(data);

      async function getAPODs(date_array) {
        var array = [];
        for (var i = 1; (number !== undefined && page !== undefined) ? (i <= days) : (i < days); i++) {
          (async function(i) {
            array.push(new Promise((resolve, reject) =>
            request.get({url: "https://apod.nasa.gov/apod/ap" + dates.getDate(date_array[i - 1]).substring(2) + ".html", encoding: null}, async function(error, response, body) {
              if (error) {
                reject(error);
              } else {
                // if APOD exists, parse it, otherwise make the object empty
                if (response.statusCode === 200) {
                  body = iconv.decode(body, encoding);
                  const $ = cheerio.load(body);
                  var data = await loader.getDay($, date_array[i - 1], html_tags, thumbs, image_thumbnail_size, api_url, multiple_thumbs, absolute_img_thumb_url);
                  resolve(data);
                } else {
                  data = {};
                  resolve(data);
                }
              }
            })
          ))
        })(i);
      };
      var output = await Promise.all(array);
      // filter out empty objects
      output = output.filter(value => Object.keys(value).length !== 0);
      resolve(output);
    }
  }
  });

  return Promise.resolve(return_data);
}
