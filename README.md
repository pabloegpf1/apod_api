# APOD API
### What's this API for?
This API is for fetching data from [NASA's APOD](https://apod.nasa.gov) website - a popular service showing the most beautiful astronomical photographs in the world. The data is returned in JSON format and can be used for many applications, such as developing mobile apps for viewing APODs. My API is much faster, has no limit regarding dates and has more functions than the [official](https://github.com/nasa/apod-api/) one (eg. `thumbnail_url` value, returned while an APOD is a video).
### How to deploy it?
You can clone the repository and deploy it yourself, or, if you use Heroku, just click this button:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
### How to use it?
The API is very easy to use, the syntax is similar to the official API. The API's endpoint is: `/api/`. Without any parameters, the API will return the latest APOD. You can specify parameters listed below.

##### Available query parameters:
- `date`: a string in YYYY-MM-DD format, when set to a date (minimum date: 1995-06-16, maximum date: today), returns an APOD from this date as a JSON object.
- `start_date` and `end_date` (you need to specify both parameters if you want to use them): strings in YYYY-MM-DD format indicating start and end of date range. All the APODs in the range will be returned as a JSON array.
- `image_thumbnail_size`: an integer, when larger than 0, `image_thumbnail` will be returned in the JSON file (see below).
- `thumbs`: a boolean, when set to `true`, a video thumbnail will be returned if the APOD is a video. Can be used in list requests.
- `html_tags`: a boolean, when set to `true`, the description will be in the original HTML format. Can be used in list requests.

#### Returned fields:
- `apod_site`: a link to the original APOD website for the given day.
- `copyright`: the copyright of the APOD.
- `date`: requested date.
- `description`: description of the APOD. It can have original HTML formatting, if `html_tags` is set to `true` (useful if you want to get links from the original description).
- `thumbnail_url`: if an APOD is a video, this field will have a link to video thumbnail (works for videos hosted on YouTube and Vimeo).
- `image_thumbnail`: returned if `image_thumbnail_size` is set to a value larger than 0, it contains relative link to smaller version of the image. Useful for thumbnails to use eg. in mobile applications.
- `url`: url of the image or video.
- `hdurl`: returned if the APOD is an image. It will return the higher resolution version of the image.
- `media_type`: depending on the APOD, it can be `image`, `video` or `other`.
- `title`: title of the APOD.


Example: `/api/?start_date=2018-10-05&end_date=2018-10-10&thumbs=true`

This query will return all the APODs between Oct 05, 2018 and Oct 10, 2018, with video thumbnails:
```
[  
   {  
      "apod_site":"https://apod.nasa.gov/apod/ap181010.html",
      "copyright":"NASA, SDO; Processing: Alan Watson via Helioviewer",
      "date":"2018-10-10",
      "description":"Sometimes, the surface of our Sun seems to dance. In the middle of 2012, for example, NASA's Sun-orbiting Solar Dynamic Observatory spacecraft imaged an impressive prominence that seemed to perform a running dive roll like an acrobatic dancer. The dramatic explosion was captured in ultraviolet light in the featured time-lapse video covering about three hours. A looping magnetic field directed the flow of hot plasma on the Sun. The scale of the dancing prominence is huge -- the entire Earth would easily fit under the flowing arch of hot gas. A quiescent prominence typically lasts about a month, and may erupt in a Coronal Mass Ejection (CME) expelling hot gas into the Solar System. The energy mechanism that creates a solar prominence is still a topic of research. Unlike 2012, this year the Sun's surface is significantly more serene, featuring fewer spinning prominences, as it is near the minimum in its 11-year magnetic cycle.",
      "thumbnail_url":"https://img.youtube.com/vi/hQFEHH5E69s/0.jpg",
      "url":"https://www.youtube.com/embed/hQFEHH5E69s?rel=0",
      "media_type":"video",
      "title":"Sun Dance"
   },
   {  
      "apod_site":"https://apod.nasa.gov/apod/ap181009.html",
      "copyright":"Hubble Legacy Archive, NASA, ESA; Processing &  Domingo Pestana & Raul Villaverde",
      "date":"2018-10-09",
      "description":"Many spiral galaxies have bars across their centers. Even our own Milky Way Galaxy is thought to have a modest central bar. Prominently barred spiral galaxy NGC 1672, featured here, was captured in spectacular detail in an image taken by the orbiting Hubble Space Telescope. Visible are dark filamentary dust lanes, young clusters of bright blue stars, red emission nebulas of glowing hydrogen gas, a long bright bar of stars across the center, and a bright active nucleus that likely houses a supermassive black hole. Light takes about 60 million years to reach us from NGC 1672, which spans about 75,000 light years across. NGC 1672, which appears toward the constellation of the Dolphinfish (Dorado), is being studied to find out how a spiral bar contributes to star formation in a galaxy's central regions.",
      "url":"https://apod.nasa.gov/apod/image/1810/NGC1672_Hubble_1080.jpg",
      "hdurl":"https://apod.nasa.gov/apod/image/1810/NGC1672_Hubble_3600.jpg",
      "media_type":"image",
      "title":"NGC 1672: Barred Spiral Galaxy from Hubble"
   },
   .
   .
   .
   {  
      "apod_site":"https://apod.nasa.gov/apod/ap181005.html",
      "copyright":"Radu-Mihai Anghel",
      "date":"2018-10-05",
      "description":"That's not a young crescent Moon poised above the hills along the western horizon at sunset. It's Venus in a crescent phase. About 54 million kilometers away and less than 20 percent illuminated, it was captured by telescope and camera on September 30 near Bacau, Romania. The bright celestial beacon is now languishing in the evening twilight, its days as the Evening Star in 2018 coming to a close. But it also grows larger in apparent size and becomes an ever thinner crescent in telescopic views. Heading toward an inferior conjunction (non-judgmental), the inner planet will be positioned between Earth and Sun on October 26 and lost from view in the solar glare. At month's end a crescent Venus will reappear in the east though, rising just before the Sun as the brilliant Morning Star.",
      "url":"https://apod.nasa.gov/apod/image/1810/Venus_Radu-Mihai_MG_3429_1067px.jpg",
      "hdurl":"https://apod.nasa.gov/apod/image/1810/Venus_Radu-Mihai_MG_3429.jpg",
      "media_type":"image",
      "title":"The Last Days of Venus as the Evening Star"
   }
]
```

### Dependencies
- Node.js - https://nodejs.org/en/
- Cheerio - https://cheerio.js.org/
- Express.js - https://expressjs.com/
- request - https://www.npmjs.com/package/request
- sharp - https://www.npmjs.com/package/sharp
