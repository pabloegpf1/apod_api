// TODO: comment the code, add documentation, make the query parameters better 

const express = require("express");
const app = express();
const port = (process.env.PORT || 3000);
const request = require('request');
const path = require('path');
const cheerio = require('cheerio');
const base_url = "https://apod.nasa.gov/apod/";

app.get("/", (req, res) => {
  if (Object.keys(req.query).length === 0) {
    res.sendFile(path.join(__dirname + '/index.html'));
  }
});

app.get("/api/", (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const date = req.query.date;
  const html_tags = req.query.html_tags;
  const thumbs = req.query.thumbs;
  const enddate = req.query.end_date;
  const startdate = req.query.start_date;

  if (date === undefined) {
    if (startdate !== undefined && enddate !== undefined) {
      if (getDate(startdate) > getDate(enddate)) {
        res.send(JSON.stringify({"error":"start_date cannot be later than end_date"}))
      } else {
        async function getAPODs() {
          var array = [];
          for (var i = 0; i <= daysDifference(startdate, enddate); i++) {
            (function(i) {
              array.push(new Promise((resolve, reject) =>
              request("https://apod.nasa.gov/apod/ap" + getDate(subtractDate(enddate, i)) + ".html", async function(error, response, body) {
                if (error) reject(error);
                const $ = cheerio.load(body);
                var data = await load_day($, subtractDate(enddate, i), html_tags, thumbs, res);
                resolve(data);
              })
            ))
          })(i);
        };
        var output = await Promise.all(array);
        output = JSON.stringify(output);
        res.send(output);
      }
      getAPODs();
      }
    } else {
      url = "https://apod.nasa.gov/apod/astropix.html";
      request(url, function(error, response, body) {
        const $ = cheerio.load(body);
        async function show() {
          var data = await load_day($, date, html_tags, thumbs, res);
          res.send(JSON.stringify(data));
        }
        show();
      });
    }
  } else {
    url = "https://apod.nasa.gov/apod/ap" + getDate(date) + ".html";
    request(url, async function(error, response, body) {
      const $ = cheerio.load(body);
      async function show() {
        var data = await load_day($, date, html_tags, thumbs, res);
        res.send(JSON.stringify(data));
      }
      show();
    });
  }
});

async function load_day(body, date, html_tags, thumbs, res) {
  var data = {};
  if (date === undefined) {
    var apod_site = "https://apod.nasa.gov/apod/astropix.html";
  } else {
    var apod_site = base_url + "ap" + getDate(date) + ".html";
  }

  data["apod_site"] = apod_site;

  var copyright = body('center').eq(1).text().trim();
  copyright = copyright.split('\n');
  copyright = copyright.slice(2);
  copyright = copyright.join('\n');
  copyright = copyright.replace(/\n/gm, " ").replace( / {2,}/g, ' ').replace(/(?:Image Credit & Copyright:?|Copyright:?|Credit:)/gm, "")
  data["copyright"] = copyright.trim();

  data["date"] = date;

  if (html_tags == "true") {
    var description = body('p').eq(2).html().replace(/<b> Explanation: <\/b>/gm, "");
  } else {
    var description = body('p').eq(2).text().replace(/Explanation: /gm, "");
  }

  data["description"] = description.replace(/\n/gm, " ").replace(/\s{2,}/g, ' ').trim();

  if (body('img').length !== 0) {
    var img = body('img').attr("src");
    data["url"] = base_url + img;

    var hd_img = body('img').parent().attr("href");
    data["hdurl"] = base_url + hd_img;

    data["media_type"] = "image";
  } else if (body('iframe').length !== 0) {
    var src = body('iframe').eq(0).attr("src");
    if (thumbs === "true") {
      data["thumbnail_url"] = await getThumbs(src);
    }
    data["url"] = src;

    data["media_type"] = "video";
  } else {
    data["media_type"] = "other";
  }


  var title = body('b').eq(0).text().trim();
  data["title"] = title;

  return data;
}

async function getThumbs(data) {
  var video_thumb;
  if (data.includes("youtube") || data.includes("youtu.be")) {
    var youtube_id_regex = /(?:(?<=(v|V)\/)|(?<=be\/)|(?<=(\?|\&)v=)|(?<=embed\/))([\w-]+)/gm;
    var video_id = data.match(youtube_id_regex);
    video_thumb = "https://img.youtube.com/vi/" + video_id + "/0.jpg";
    return video_thumb;
  } else if (data.includes("vimeo")) {
    var vimeo_id_regex = /(?!\/video\/)(\d+)/gm;
    var vimeo_id = data.match(vimeo_id_regex)[0];
    url = "https://vimeo.com/api/v2/video/" + vimeo_id + ".json"
    return new Promise(function(resolve, reject) {
      request(url, function(error, response, body) {
        if (error) return reject(error);
        video_thumb = JSON.parse(body);
        video_thumb = video_thumb[0].thumbnail_large.toString();
        try {
          resolve(video_thumb);
        } catch (e) {
          reject(e)
        }
      });
    });
  } else {
    return "";
  }
}

function daysDifference(startdate, enddate) {
  var d1 = new Date(startdate);
  var d2 = new Date(enddate);

  return Math.round(Math.abs((d1.getTime() - d2.getTime()) / (24*60*60*1000)));
}

function getDate(date) {
  var d = new Date(date);
  d.setDate(d.getDate());
  month = '' + (d.getMonth() + 1),
  day = '' + d.getDate(),
  year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year.toString().substring(2,4), month, day].join("");
}

function subtractDate(date, subtract) {
  var d = new Date(date);
  d.setDate(d.getDate() - subtract);
  month = '' + (d.getMonth() + 1),
  day = '' + d.getDate(),
  year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

app.listen(port, () => console.log(`API server running on port ${port}!`))
