const dates = require('./date.js');
const request = require('request');

var exports = module.exports = {};
const base_url = "https://apod.nasa.gov/apod/";

exports.getDay = async function (body, date, html_tags, thumbs, res, image_thumbnail_size) {
  var data = {};
  // if date was not specified in the URL, get it from body and use it
  if (date === undefined) {
    date = dates.subtractDate(body('p').eq(1).text(), 0);
    var apod_site = base_url + "ap" + dates.getDate(date).substring(2) + ".html";
  } else {
    var apod_site = base_url + "ap" + dates.getDate(date).substring(2) + ".html";
  }

  data["apod_site"] = apod_site;

  if (dates.getDate(date) < dates.getDate("1996-10-09") && dates.getDate(date) > dates.getDate("1995-09-21")) { // it's an APOD structured the old way

    var copyright = body('center').eq(0).contents().text().replace(/\n/gm, " ").replace( / {2,}/g, ' ').replace(/.+:/, "").trim();
    data["copyright"] = copyright;

    data["date"] = date;

    if (html_tags == "true") {
      var description = body("body").html();
      description = description.replace(/<\/b>/gm, "").replace(/<b>/gm, "").replace(/<\/p>/gm, "").replace(/<p>/gm, "").replace(/<\/center>/gm, "").replace(/<center>/gm, "");
      description = description.replace(/\"ap/gm, "\"https://apod.nasa.gov/apod/ap");
      description = description.replace(/\/\s/gm, "/");
      // replace relative URLs with absolute URL for NASA websites
      description = description.replace(/(href=\")(?!http:\/\/|https:\/\/|ap)/gm, "href=\"https://apod.nasa.gov/");
    } else {
      var description = body("body").contents().text();
    }

    description = description.replace(/\n/gm, " ").replace( / {2,}/g, ' ').replace(/^.+Explanation:/, "").replace(/Tomorrow('s|&apos;s) picture:.+/, "").trim();
    data["description"] = description;


    // detect if APOD is an image, video or neither of them
    if (body('img').length !== 0) {
      var img = body('img').attr("src");
      if (image_thumbnail_size > 0) {
        var img_thumb = "image/?image=" + base_url + img + "&width=" + image_thumbnail_size;
        data["image_thumbnail"] = img_thumb;
      }
      data["url"] = base_url + img;

      var hd_img = body('img').parent().attr("href");
      data["hdurl"] = base_url + hd_img;

      data["media_type"] = "image";
    } else if (body('iframe').length !== 0) {
      var src = body('iframe').eq(0).attr("src");
      if (src.includes("youtu") || src.includes("youtube") || src.includes("vimeo")) {
        if (thumbs === "true") {
          data["thumbnail_url"] = await getThumbs(src);
          if (image_thumbnail_size > 0) {
            var img_thumb = "/image/?image=" + await getThumbs(src) + "&width=" + image_thumbnail_size;
            data["image_thumbnail"] = img_thumb;
          }
        }
        data["url"] = src;

        data["media_type"] = "video";
      } else {
        data["media_type"] = "other";
      }
    } else {
      data["media_type"] = "other";
    }

    var title = body('b').eq(0).text().trim().replace(/\n.+/gm, "");
    if (title === "") {
      title = "APOD for " + date;
    }
    data["title"] = title;

  } else if (dates.getDate(date) <= dates.getDate("1995-09-21") && dates.getDate(date) >= dates.getDate("1995-06-16")) { // it's an APOD structured the oldest way

    if (html_tags == "true") {
      var description = body("body").html();
      description = description.replace(/<\/b>/gm, "").replace(/<b>/gm, "").replace(/<\/p>/gm, "").replace(/<p>/gm, "").replace(/<\/center>/gm, "").replace(/<center>/gm, "");
      description = description.replace(/\"ap/gm, "\"https://apod.nasa.gov/apod/ap");
      description = description.replace(/\/\s/gm, "/");
      // replace relative URLs with absolute URL for NASA websites
      description = description.replace(/(href=\")(?!http:\/\/|https:\/\/|ap)/gm, "href=\"https://apod.nasa.gov/");
    } else {
      var description = body("body").contents().text();
    }
    if (dates.getDate(date) != dates.getDate("1995-06-16")) {
      var copyright = description.replace(/\n/gm, " ").replace( / {2,}/g, ' ').replace(/^.+Credit:/, "").replace(/Explanation:.+/, "").trim();
      data["copyright"] = copyright;
    }

    description = description.replace(/\n/gm, " ").replace( / {2,}/g, ' ').replace(/^.+Explanation:/, "").replace(/Tomorrow('s|&apos;s) picture:.+/, "").trim();


    data["date"] = date;

    data["description"] = description;


    // detect if APOD is an image, video or neither of them
    if (body('img').length !== 0) {
      var img = body('img').attr("src");
      if (image_thumbnail_size > 0) {
        var img_thumb = "image/?image=" + base_url + img + "&width=" + image_thumbnail_size;
        data["image_thumbnail"] = img_thumb;
      }
      data["url"] = base_url + img;

      var hd_img = body('img').parent().attr("href");
      data["hdurl"] = base_url + hd_img;

      data["media_type"] = "image";
    } else if (body('iframe').length !== 0) {
      var src = body('iframe').eq(0).attr("src");
      if (src.includes("youtu") || src.includes("youtube") || src.includes("vimeo")) {
        if (thumbs === "true") {
          data["thumbnail_url"] = await getThumbs(src);
          if (image_thumbnail_size > 0) {
            var img_thumb = "/image/?image=" + await getThumbs(src) + "&width=" + image_thumbnail_size;
            data["image_thumbnail"] = img_thumb;
          }
        }
        data["url"] = src;

        data["media_type"] = "video";
      } else {
        data["media_type"] = "other";
      }
    } else {
      data["media_type"] = "other";
    }

    var title = body('b').eq(0).text().trim().replace(/\n.+/gm, "");
    if (title === "") {
      title = "APOD for " + date;
    }
    data["title"] = title;

  } else { // it's an APOD structured the new way

    var copyright = body('center').eq(1).text().trim();
    copyright = copyright.split('\n');
    copyright = copyright.slice(2);
    copyright = copyright.join('\n');
    copyright = copyright.replace(/\n/gm, " ").replace( / {2,}/g, ' ').replace(/(?:Image Credit & Copyright:?|Copyright:?|Credit:|Credit and copyright:)/gmi, "");
    var title = body('b').eq(0).text().trim();
    if (title === "") {
      title = "APOD for " + date;
    }

    data["copyright"] = copyright.trim();

    data["date"] = date;

    if (html_tags == "true") {
      var description = body('p').eq(2).html().replace(/<b> Explanation: <\/b>/gm, "");
      description = description.replace(/\"ap/gm, "\"https://apod.nasa.gov/apod/ap");
      description = description.replace(/\/\s/gm, "/");
      // replace relative URLs with absolute URL for NASA websites
      description = description.replace(/(href=\")(?!http:\/\/|https:\/\/|ap)/gm, "href=\"https://apod.nasa.gov/");
    } else {
      var description = body('p').eq(2).text().replace(/Explanation: /gm, "");
    }

    data["description"] = description.replace(/\n/gm, " ").replace(/\s{2,}/g, ' ').trim();

    // detect if APOD is an image, video or neither of them
    if (body('img').length !== 0) {
      var img = body('img').attr("src");
      if (image_thumbnail_size > 0) {
        var img_thumb = "image/?image=" + base_url + img + "&width=" + image_thumbnail_size;
        data["image_thumbnail"] = img_thumb;
      }
      data["url"] = base_url + img;

      var hd_img = body('img').parent().attr("href");
      data["hdurl"] = base_url + hd_img;

      data["media_type"] = "image";
    } else if (body('iframe').length !== 0) {
      var src = body('iframe').eq(0).attr("src");
      if (src.includes("youtu") || src.includes("youtube") || src.includes("vimeo")) {
        if (thumbs === "true") {
          data["thumbnail_url"] = await getThumbs(src);
          if (image_thumbnail_size > 0) {
            var img_thumb = "/image/?image=" + await getThumbs(src) + "&width=" + image_thumbnail_size;
            data["image_thumbnail"] = img_thumb;
          }
        }
        data["url"] = src;

        data["media_type"] = "video";
      } else {
        data["media_type"] = "other";
      }
    } else {
      data["media_type"] = "other";
    }

    data["title"] = title;
  }

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
    video_thumb = "https://img.youtube.com/vi/" + video_id + "/0.jpg";
    return video_thumb;
  // get Vimeo thumbnail through Vimeo API
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
