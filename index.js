const express = require("express");
const app = express();
const port = (process.env.PORT || 3000);
const request = require('request');
const path = require('path');
const cheerio = require('cheerio');
const base_url = "https://apod.nasa.gov/apod/";
const dates = require('./date.js');
const loader = require('./loader.js');
const resize = require('./resize.js');
const iconv = require('iconv-lite');

var encoding = 'windows-1252';

// help endpoint
app.get("/", (req, res) => {
  if (Object.keys(req.query).length === 0) {
    res.sendFile(path.join(__dirname + '/index.html'));
  }
});

// API endpoint
app.get("/api/", (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  // possible query parameters
  const date = req.query.date;
  const html_tags = req.query.html_tags;
  const thumbs = req.query.thumbs;
  const enddate = req.query.end_date;
  const startdate = req.query.start_date;
  const image_thumbnail_size = req.query.image_thumbnail_size;
  const absolute_img_thumb_url = req.query.absolute_thumbnail_url;
  // get absolute API url
  const api_url = `${req.headers.host}/`;
  var multiple_thumbs = false;
  if (Array.isArray(image_thumbnail_size)) {
    multiple_thumbs = true;
  }

  if (date === undefined) {
    if (startdate !== undefined && enddate !== undefined) {
      if (dates.getDate(startdate) > dates.getDate(enddate)) { // TODO: fix it before 2095
        res.status(400);
        res.send(JSON.stringify({"error":"start_date cannot be later than end_date"}));
      } else if (dates.getDate(startdate) < dates.getDate("1995-06-16")) {
        res.status(404);
        res.send(JSON.stringify({"error":"start_date cannot be before the first APOD (June 16, 1995)"}));
      } else {
        // get list of APODs between start_date and end_date
        async function getAPODs() {
          var array = [];
          for (var i = 0; i <= dates.daysDifference(startdate, enddate); i++) {
            (function(i) {
              array.push(new Promise((resolve, reject) =>
              request.get({url: "https://apod.nasa.gov/apod/ap" + dates.getDate(dates.subtractDate(enddate, i)).substring(2) + ".html", encoding: null}, async function(error, response, body) {
                if (error) reject(error);
                // if APOD exists, parse it, otherwise make the object empty
                if (response.statusCode === 200) {
                  body = iconv.decode(body, encoding);
                  const $ = cheerio.load(body);
                  var data = await loader.getDay($, dates.subtractDate(enddate, i), html_tags, thumbs, res, image_thumbnail_size, api_url, multiple_thumbs, absolute_img_thumb_url);
                  resolve(data);
                } else {
                  data = {};
                  resolve(data);
                }
              })
            ))
          })(i);
        };
        var output = await Promise.all(array);
        // filter out empty objects
        output = output.filter(value => Object.keys(value).length !== 0);
        output = JSON.stringify(output);
        // show JSON array
        res.send(output);
      }
      getAPODs();
      }
    } else {
      // get the APOD for today
      url = "https://apod.nasa.gov/apod/astropix.html";
      request.get({url: url, encoding: null}, function(error, response, body) {
        // if exists, parse it, otherwise throw 'not found' error
        if (response.statusCode === 200) {
          body = iconv.decode(body, encoding);
          const $ = cheerio.load(body);
          async function show() {
            var data = await loader.getDay($, date, html_tags, thumbs, res, image_thumbnail_size, api_url, multiple_thumbs, absolute_img_thumb_url);
            res.send(JSON.stringify(data));
          }
          show();
        } else {
          res.status(404);
          res.send(JSON.stringify({"error":"No APOD for this date."}))
        }
      });
    }
  } else {
    // if date is after the first APOD, parse the APOD, otherwise throw error
    if (dates.getDate(date) >= dates.getDate("1995-06-16")) {
      url = "https://apod.nasa.gov/apod/ap" + dates.getDate(date).substring(2) + ".html";
      request.get({url: url, encoding: null}, async function(error, response, body) {
        // if exists, parse it, otherwise throw 'not found' error
        if (response.statusCode === 200) {
          body = iconv.decode(body, encoding);
          const $ = cheerio.load(body);
          async function show() {
            var data = await loader.getDay($, date, html_tags, thumbs, res, image_thumbnail_size, api_url, multiple_thumbs, absolute_img_thumb_url);
            res.send(JSON.stringify(data));
          }
          show();
        } else {
          res.status(404);
          res.send(JSON.stringify({"error":"An error happened while requesting the APOD. Maybe the date is wrong?"}));
        }
      });
    } else {
      res.send(JSON.stringify({"error":"\`date\` cannot be before the first APOD (June 16, 1995)"}))
    }
  }
});

// image resize endpoint
app.get("/image/", (req, res) => {
  if (Object.keys(req.query).length === 0) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400);
    res.send(JSON.stringify({"error":"Please specify a path to APOD image"}));
  } else {
    const width = req.query.width;
    const image = req.query.image;
    if (width > 0 && image !== undefined) {
      res.type(`image/"jpg"`);
      res.setHeader("Content-Type", "image/jpeg");
      // resize image if width and path are valid
      if (image.includes("youtu.be") || image.includes("youtube") || image.includes("vimeo") || image.includes("apod.nasa.gov")) {
        resize(image, parseInt(width)).pipe(res);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(400);
        res.send(JSON.stringify({"error":"Image path cannot be other than official NASA APOD website, YouTube thumbnail or Vimeo thumbnail."}));
      }
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.status(400);
      res.send(JSON.stringify({"error":"Please specify valid width and image path"}));
    }
  }
});

app.listen(port, () => console.log(`API server running on port ${port}!`))
