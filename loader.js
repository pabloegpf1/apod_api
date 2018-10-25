const dates = require('./date.js');
const request = require('request');

var exports = module.exports = {};
const base_url = "https://apod.nasa.gov/apod/";

exports.getDay = async function (body, date, html_tags, thumbs, res, image_thumbnail_size, api_url, multiple_thumbs, absolute_img_thumb_url) {
  if (absolute_img_thumb_url !== "true") {
    api_url = "";
  }
  // data that can be returned
  var apod_site, copyright, date, description, hdurl, image_thumbnail, media_type, thumbnail_url, title, url;
  // create an empty object
  var data = {};
  // if date was not specified in the URL, get it from body and use it
  if (date === undefined) {
    date = dates.subtractDate(body('p').eq(1).text(), 0);
  }
  apod_site = `${base_url}ap${dates.getDate(date).substring(2)}.html`;

  // detect if APOD is an image, video or neither of them
  if (body('img').length !== 0) {
    var img = body('img').attr("src");
    if (image_thumbnail_size != undefined) {
      // if there are multiple size parameters, return links to smaller images as an array
      if (multiple_thumbs) {
        (async function() {
          var array = [];
          for (let thumb_size of image_thumbnail_size) {
            await array.push(`${api_url}image/?image=${base_url + img}&width=${thumb_size}`);
            data["image_thumbnail"] = array;
          }
        })();
      } else {
        image_thumbnail = `${api_url}image/?image=${base_url + img}&width=${image_thumbnail_size}`;
      }
    }
    url = base_url + img;

    var hd_img = body('img').parent().attr("href");
    hdurl = base_url + hd_img;

    media_type = "image";
  } else if (body('iframe').length !== 0) {
    var src = body('iframe').eq(0).attr("src");
    if (src.includes("youtu") || src.includes("youtube") || src.includes("vimeo")) {
      if (thumbs === "true") {
        thumbnail_url = await getThumbs(src);
      }
      if (image_thumbnail_size != undefined) {
        var img_thumb;
        // if there are multiple size parameters, return links to smaller images as an array
        if (multiple_thumbs) {
          (async function() {
            var array = [];
            for (let thumb_size of image_thumbnail_size) {
              await array.push(`${api_url}image/?image=${await getThumbs(src)}&width=${thumb_size}`);
              data["image_thumbnail"] = array;
            }
          })();
        } else {
          img_thumb = `${api_url}image/?image=${await getThumbs(src)}&width=${image_thumbnail_size}`;
        }
        image_thumbnail = img_thumb;
      }
      url = src;

      media_type = "video";
    } else {
      media_type = "other";
    }
  } else {
    media_type = "other";
  }

  if (dates.getDate(date) < dates.getDate("1996-10-09") && dates.getDate(date) > dates.getDate("1995-09-21")) { // it's an APOD structured the old way

    copyright = body('center').eq(0).contents().text().replace(/\n/gm, " ").replace( / {2,}/g, ' ').replace(/.+:/, "").trim();

    if (html_tags == "true") {
      description = body("body").html();
      description = description.replace(/<\/b>/gm, "").replace(/<b>/gm, "").replace(/<\/p>/gm, "").replace(/<p>/gm, "").replace(/<\/center>/gm, "").replace(/<center>/gm, "");
      description = description.replace(/\"ap/gm, "\"https://apod.nasa.gov/apod/ap");
      description = description.replace(/\/\s/gm, "/");
      // replace relative URLs with absolute URL for NASA websites
      description = description.replace(/(href=\")(?!http:\/\/|https:\/\/|ap)/gm, "href=\"https://apod.nasa.gov/");
    } else {
      description = body("body").contents().text();
    }

    description = description.replace(/\n/gm, " ").replace( / {2,}/g, ' ').replace(/^.+Explanation:/, "").replace(/Tomorrow('s|&apos;s) picture:.+/, "").trim();

    title = body('b').eq(0).text().trim().replace(/\n.+/gm, "");

  } else if (dates.getDate(date) <= dates.getDate("1995-09-21") && dates.getDate(date) >= dates.getDate("1995-06-16")) { // it's an APOD structured the oldest way

    if (html_tags == "true") {
      description = body("body").html();
      description = description.replace(/<\/b>/gm, "").replace(/<b>/gm, "").replace(/<\/p>/gm, "").replace(/<p>/gm, "").replace(/<\/center>/gm, "").replace(/<center>/gm, "");
      description = description.replace(/\"ap/gm, "\"https://apod.nasa.gov/apod/ap");
      description = description.replace(/\/\s/gm, "/");
      // replace relative URLs with absolute URL for NASA websites
      description = description.replace(/(href=\")(?!http:\/\/|https:\/\/|ap)/gm, "href=\"https://apod.nasa.gov/");
    } else {
      description = body("body").contents().text();
    }
    if (dates.getDate(date) != dates.getDate("1995-06-16")) {
      copyright = description.replace(/\n/gm, " ").replace( / {2,}/g, ' ').replace(/^.+Credit:/, "").replace(/Explanation:.+/, "").trim();
    }

    description = description.replace(/\n/gm, " ").replace( / {2,}/g, ' ').replace(/^.+Explanation:/, "").replace(/Tomorrow('s|&apos;s) picture:.+/, "").trim();

    title = body('b').eq(0).text().trim().replace(/\n.+/gm, "");

  } else { // it's an APOD structured the new way

    copyright = body('center').eq(1).text().trim();
    copyright = copyright.split('\n');
    copyright = copyright.slice(2);
    copyright = copyright.join('\n');
    copyright = copyright.replace(/\n/gm, " ").replace( / {2,}/g, ' ').replace(/(?:Image Credit & Copyright:?|Copyright:?|Credit:|Credit and copyright:)/gmi, "");
    title = body('b').eq(0).text().trim();

    copyright = copyright.trim();

    if (html_tags == "true") {
      description = body('p').eq(2).html().replace(/<b> Explanation: <\/b>/gm, "");
      description = description.replace(/\"ap/gm, "\"https://apod.nasa.gov/apod/ap");
      description = description.replace(/\/\s/gm, "/");
      // replace relative URLs with absolute URL for NASA websites
      description = description.replace(/(href=\")(?!http:\/\/|https:\/\/|ap)/gm, "href=\"https://apod.nasa.gov/");
    } else {
      description = body('p').eq(2).text().replace(/Explanation: /gm, "");
    }

    description = description.replace(/\n/gm, " ").replace(/\s{2,}/g, ' ').trim();
  }

  if (title === "") {
    title = "APOD for " + date;
  }

  // add everything to the object
  data["apod_site"] = apod_site;
  data["copyright"] = copyright;
  data["date"] = date;
  data["description"] = description;
  data["hdurl"] = hdurl;
  data["image_thumbnail"] = image_thumbnail;
  data["media_type"] = media_type;
  data["thumbnail_url"] = thumbnail_url;
  data["title"] = title;
  data["url"] = url;

  // return all the data
  return data;
};

// get thumbnail if APOD is a video
async function getThumbs(data) {
  var video_thumb;
  // get YouTube thumbnail
  if (data.includes("youtube") || data.includes("youtu.be")) {
    var youtube_id_regex = /(?:(?<=(v|V)\/)|(?<=be\/)|(?<=(\?|\&)v=)|(?<=embed\/))([\w-]+)/gm;
    var video_id = data.match(youtube_id_regex);
    video_thumb = `https://img.youtube.com/vi/${video_id}/0.jpg`;
    return video_thumb;
  // get Vimeo thumbnail through Vimeo API
  } else if (data.includes("vimeo")) {
    var vimeo_id_regex = /(?!\/video\/)(\d+)/gm;
    var vimeo_id = data.match(vimeo_id_regex)[0];
    url = `https://vimeo.com/api/v2/video/${vimeo_id}.json`
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
