/* eslint-disable no-console */
const express = require('express');
const port = process.env.PORT || 3000;
const request = require('request');
const path = require('path');
const cheerio = require('cheerio');
const dates = require('./utils/date.js');
const loader = require('./utils/loader.js');
const resize = require('./utils/resize.js');
const search = require('./search.js');
const iconv = require('iconv-lite');
const cors = require('cors');
const app = express();

var client = require('redis').createClient(process.env.REDIS_URL);

client.on('error', (err) => {
  console.log(`Redis error: ${err}`);
});

let encoding = 'windows-1252';

// help endpoint
app.get('/', (req, res) => {
  if (Object.keys(req.query).length === 0) {
    res.sendFile(path.join(__dirname + '/static/index.html'));
  }
});

// API endpoint
app.get('/api/', cors(), (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  // possible query parameters
  const date = req.query.date;
  const html_tags = req.query.html_tags;
  const thumbs = req.query.thumbs;
  const enddate = req.query.end_date;
  const startdate = req.query.start_date;
  const image_thumbnail_size = req.query.image_thumbnail_size;
  const absolute_img_thumb_url = req.query.absolute_thumbnail_url;
  const count = req.query.count;
  // get absolute API url
  const api_url = `${req.headers.host}/`;
  let multiple_thumbs = false;
  if (Array.isArray(image_thumbnail_size)) {
    multiple_thumbs = true;
  }

  var key = `a:${date}.${html_tags}.${thumbs}.${enddate}.${startdate}.${image_thumbnail_size}.${absolute_img_thumb_url}.${count}`;

  function throwError(message, code) {
    res.status(code);
    res.send(JSON.stringify({ error: message }));
  }

  async function getAPODs() {
    client.get(key, async function (err, data) {
      if (data) {
        res.send(data);
      } else {
        let array = [];
        for (let i = 0; i <= dates.daysDifference(startdate, enddate); i++) {
          (function (i) {
            array.push(
              new Promise((resolve, reject) =>
                request.get(
                  {
                    url:
                      'https://apod.nasa.gov/apod/ap' +
                      dates
                        .getDate(dates.subtractDate(enddate, i))
                        .substring(2) +
                      '.html',
                    encoding: null,
                  },
                  async function (error, response, body) {
                    if (error) reject(error);
                    // if APOD exists, parse it, otherwise make the object empty
                    if (response.statusCode === 200) {
                      body = iconv.decode(body, encoding);
                      const $ = cheerio.load(body);
                      let data = await loader.getDay(
                        $,
                        dates.subtractDate(enddate, i),
                        html_tags,
                        thumbs,
                        image_thumbnail_size,
                        api_url,
                        multiple_thumbs,
                        absolute_img_thumb_url
                      );
                      resolve(data);
                    } else {
                      let data = {};
                      resolve(data);
                    }
                  }
                )
              )
            );
          })(i);
        }
        let output = await Promise.all(array);
        // filter out empty objects
        output = output.filter((value) => Object.keys(value).length !== 0);
        output = JSON.stringify(output);
        client.set(key, output);
        // show JSON array
        res.send(output);
      }
    });
  }

  async function show($, date) {
    let data = await loader.getDay(
      $,
      date,
      html_tags,
      thumbs,
      image_thumbnail_size,
      api_url,
      multiple_thumbs,
      absolute_img_thumb_url
    );
    res.send(JSON.stringify(data));
  }

  async function getCount(count) {
    let array = [];
    for (let i = 0; i < count; i++) {
      (function get() {
        let date = dates.getRandom();
        array.push(
          new Promise((resolve, reject) =>
            request.get(
              {
                url: 'https://apod.nasa.gov/apod/ap' + date.joined + '.html',
                encoding: null,
              },
              async function (error, response, body) {
                if (error) reject(error);
                // if APOD exists, parse it, otherwise make the object empty
                if (response.statusCode === 200) {
                  body = iconv.decode(body, encoding);
                  const $ = cheerio.load(body);
                  let data = await loader.getDay(
                    $,
                    date.request,
                    html_tags,
                    thumbs,
                    image_thumbnail_size,
                    api_url,
                    multiple_thumbs,
                    absolute_img_thumb_url
                  );
                  resolve(data);
                } else {
                  get();
                }
              }
            )
          )
        );
      })();
    }
    let output = await Promise.all(array);
    res.send(JSON.stringify(output));
  }

  if (date === undefined) {
    if (startdate !== undefined && enddate !== undefined) {
      if (dates.getDate(startdate) > dates.getDate(enddate)) {
        throwError('start_date cannot be later than end_date', 404);
      } else if (dates.getDate(startdate) < dates.getDate('1995-06-16')) {
        throwError('start_date cannot be later than end_date', 404);
      } else {
        // get list of APODs between start_date and end_date
        getAPODs();
      }
    } else if (count !== undefined) {
      if (count > 0) {
        getCount(count);
      } else {
        throwError('count must be larger than 0', 400);
      }
    } else {
      // get the APOD for today
      let url = 'https://apod.nasa.gov/apod/astropix.html';
      client.get(key, function (err, data) {
        if (data) {
          const $ = cheerio.load(data);
          show($, date);
        } else {
          request.get({ url: url, encoding: null }, function (
            error,
            response,
            body
          ) {
            if (response) {
              if (response.statusCode === 200) {
                body = iconv.decode(body, encoding);
                const $ = cheerio.load(body);
                client.setex(key, 60 * 30, body);

                show($, date);
              } else {
                throwError('An error happened while requesting the APOD.', 404);
              }
            } else {
              throwError('An error happened while requesting the APOD.', 404);
            }
          });
        }
      });
    }
  } else {
    // if date is after the first APOD, parse the APOD, otherwise throw error
    if (dates.getDate(date) >= dates.getDate('1995-06-16')) {
      let url =
        'https://apod.nasa.gov/apod/ap' +
        dates.getDate(date).substring(2) +
        '.html';
      client.get(key, function (err, data) {
        if (data) {
          const $ = cheerio.load(data);
          show($, date);
        } else {
          request.get({ url: url, encoding: null }, function (
            error,
            response,
            body
          ) {
            if (response) {
              if (response.statusCode === 200) {
                body = iconv.decode(body, encoding);
                const $ = cheerio.load(body);
                client.set(key, body);

                show($, date);
              } else {
                throwError('An error happened while requesting the APOD.', 404);
              }
            } else {
              throwError('An error happened while requesting the APOD.', 404);
            }
          });
        }
      });
    } else {
      throwError('`date` cannot be before the first APOD (June 16, 1995)', 404);
    }
  }
});

// search endpoint
app.get('/search/', cors(), (req, res) => {
  const html_tags = req.query.html_tags;
  const thumbs = req.query.thumbs;
  const image_thumbnail_size = req.query.image_thumbnail_size;
  const absolute_img_thumb_url = req.query.absolute_thumbnail_url;
  const query = req.query.search_query;
  const number = req.query.number;
  const page = req.query.page;
  const api_url = `${req.headers.host}/`;
  let multiple_thumbs = false;
  if (Array.isArray(image_thumbnail_size)) {
    multiple_thumbs = true;
  }

  var key = `s:${html_tags}.${thumbs}.${image_thumbnail_size}.${absolute_img_thumb_url}.${query}.${number}.${page}.${api_url}`;

  async function show($) {
    let data = await search.find(
      $,
      html_tags,
      thumbs,
      image_thumbnail_size,
      api_url,
      multiple_thumbs,
      absolute_img_thumb_url,
      number,
      page
    );
    if (data !== null && data !== undefined && data.length > 0) {
      res.send(JSON.stringify(data));
    } else {
      res.status(404);
      res.send(JSON.stringify({ error: `No results for query '${query}'` }));
    }
  }

  if (query !== undefined) {
    res.setHeader('Content-Type', 'application/json');
    let url = 'https://apod.nasa.gov/cgi-bin/apod/apod_search?tquery=' + query;

    client.get(key, async function (err, data) {
      if (data) {
        const $ = cheerio.load(data);
        show($);
      } else {
        request.get({ url: url, encoding: null }, async function (
          error,
          response,
          body
        ) {
          if (error) {
            res.status(500);
            res.send(
              JSON.stringify({
                error: 'An error happened while requesting APOD website.',
              })
            );
          } else if (response) {
            if (response.statusCode === 200) {
              body = iconv.decode(body, encoding);
              client.setex(key, 60 * 30, body);
              const $ = cheerio.load(body);
              show($);
            } else {
              res.status(500);
              res.send(
                JSON.stringify({
                  error: 'An error happened while requesting APOD website.',
                })
              );
            }
          } else {
            res.status(500);
            res.send(
              JSON.stringify({
                error: 'An error happened while requesting APOD website.',
              })
            );
          }
        });
      }
    });
  } else {
    res.sendFile(path.join(__dirname + '/static/search.html'));
  }
});

// image resize endpoint
app.get('/image/', cors(), (req, res) => {
  if (Object.keys(req.query).length === 0) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400);
    res.send(JSON.stringify({ error: 'Please specify a path to APOD image' }));
  } else {
    const width = req.query.width;
    const image = req.query.image;
    if (width > 0 && image !== undefined) {
      res.type('image/"jpg"');
      res.setHeader('Content-Type', 'image/jpeg');
      // resize image if width and path are valid
      if (
        image.includes('youtu.be') ||
        image.includes('youtube') ||
        image.includes('vimeo') ||
        image.includes('apod.nasa.gov')
      ) {
        resize(image, parseInt(width)).pipe(res);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(400);
        res.send(
          JSON.stringify({
            error:
              'Image path cannot be other than official NASA APOD website, YouTube thumbnail or Vimeo thumbnail.',
          })
        );
      }
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.status(400);
      res.send(
        JSON.stringify({ error: 'Please specify valid width and image path' })
      );
    }
  }
});

app.listen(port, () => console.log(`API server running on port ${port}!`));
