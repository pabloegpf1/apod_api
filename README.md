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
- `absolute_thumbnail_url`: a boolean, when set to `true`, `image_thumbnail`s will have absolute, not relative URLs.
- `thumbs`: a boolean, when set to `true`, a video thumbnail will be returned if the APOD is a video. Can be used in list requests.
- `html_tags`: a boolean, when set to `true`, the description will be in the original HTML format. Can be used in list requests.

##### Returned fields:
- `apod_site`: a link to the original APOD website for the given day.
- `copyright`: the copyright of the APOD.
- `date`: requested date.
- `description`: description of the APOD. It can have original HTML formatting, if `html_tags` is set to `true` (useful if you want to get links from the original description).
- `thumbnail_url`: if an APOD is a video, this field will have a link to video thumbnail (works for videos hosted on YouTube and Vimeo).
- `image_thumbnail`: returned if `image_thumbnail_size` is set to a value larger than 0, it contains relative link to smaller version of the image. Useful for thumbnails to use eg. in mobile applications. If there are more than one `image_thumbnail_size` parameters set, multiple thumbnails will be returned in a JSON array in `image_thumbnail` value.
- `url`: url of the image or video.
- `hdurl`: returned if the APOD is an image. It will return the higher resolution version of the image.
- `media_type`: depending on the APOD, it can be `image`, `video` or `other`.
- `title`: title of the APOD.

#### Examples
Example url: `/api/`

This query will return the latest available APOD, with no additional options:
```
{
   "apod_site":"https://apod.nasa.gov/apod/ap181027.html",
   "copyright":"Yuri Beletsky (Carnegie Las Campanas Observatory, TWAN)",
   "date":"2018-10-27",
   "description":"The best known asterism in northern skies hangs over the Canadian Rockies in this mountain and night skyscape taken last week from Banff National Park. But most remarkable is the amazing greenish airglow. With airglow visible to the eye, but not in color, the scene was captured in two exposures with a single camera, one exposure made while tracking the stars and one fixed to a tripod. Airglow emission is predominately from atmospheric oxygen atoms at extremely low densities. Commonly recorded in color by sensitive digital cameras the eerie, diffuse light is seen here in waves across the northern night. Originating at an altitude similar to aurorae, the luminous airglow is due to chemiluminescence, the production of light through chemical excitation and radiative decay. Energy for the chemical excitation is provided during daytime by the Sun's extreme ultraviolet radiation. Unlike aurorae which are limited to high latitudes, airglow can be found around the globe.",
   "hdurl":"https://apod.nasa.gov/apod/image/1810/airglow_banff_beletsky.jpg",
   "media_type":"image",
   "title":"Airglow Borealis",
   "url":"https://apod.nasa.gov/apod/image/1810/airglow_banff_beletsky1082.jpg"
}
```

Example url: `/api/?date=2005-12-24&html_tags=true&image_thumbnail_size=450&absolute_thumbnail_url=true`

This query will return APOD from Dec 24, 2005, with the original HTML tags in the text and with an absolute path to the 450px thumbnail of the image
```
{
   "apod_site":"https://apod.nasa.gov/apod/ap051224.html",
   "copyright":"Apollo 8, NASA",
   "date":"2005-12-24",
   "description":"In December of 1968, the <a href=\"http://www.lpi.usra.edu/expmoon/Apollo8/Apollo8.html\">Apollo 8</a> crew flew from the <a href=\"http://jv.gilead.org.il/pg/moon/\">Earth to the Moon</a> and back again. <a href=\"http://www.jsc.nasa.gov/Bios/htmlbios/borman-f.html\">Frank Borman</a>, <a href=\"http://www.jsc.nasa.gov/Bios/htmlbios/lovell-ja.html\">James Lovell</a>, and <a href=\"http://www.jsc.nasa.gov/Bios/htmlbios/anders-wa.html\">William Anders</a> were launched atop a <a href=\"http://www.apollosaturn.com/saturnv.htm\">Saturn V rocket</a> on December 21, circled the Moon ten times in their command module, and returned to Earth on December 27. The <a href=\"http://nssdc.gsfc.nasa.gov/database/MasterCatalog?sc=1968-118A\">Apollo 8</a> mission&apos;s impressive list of firsts includes: the first humans to journey to the <a href=\"http://www.nineplanets.org/luna.html\">Earth&apos;s Moon</a>, the first manned flight using the <a href=\"https://apod.nasa.gov/apod/ap010525.html\">Saturn V</a>, and the first <a href=\"http://www.lpi.usra.edu/expmoon/Apollo8/A08_Photography.html\">to photograph</a> the Earth from deep space. As the Apollo 8 command module rounded the farside of the Moon, the crew could look toward the <a href=\"https://apod.nasa.gov/apod/ap010713.html\">lunar horizon</a> and see the Earth appear to rise, due to their spacecraft&apos;s orbital motion. The <a href=\"http://www.abc.net.au/science/moon/earthrise.htm\">famous picture </a> that resulted, of a distant <a href=\"https://apod.nasa.gov/apod/ap030426.html\">blue Earth</a> above the Moon&apos;s limb, was a marvelous gift to the world.",
   "hdurl":"https://apod.nasa.gov/apod/image/0512/as8-14-2383HR.jpg",
   "image_thumbnail":"apod.api.example.com/image/?image=https://apod.nasa.gov/apod/image/0512/as8-14-2383c75.jpg&width=450",
   "media_type":"image",
   "title":"Earthrise",
   "url":"https://apod.nasa.gov/apod/image/0512/as8-14-2383c75.jpg"
}
```
Example url: `/api/?start_date=2018-10-05&end_date=2018-10-10&thumbs=true&image_thumbnail_size=480&image_thumbnail_size=240`

This query will return all the APODs between Oct 05, 2018 and Oct 10, 2018, with video thumbnails and 480 and 240 px thumbnails of the images:
```
[
   {
      "apod_site":"https://apod.nasa.gov/apod/ap181010.html",
      "copyright":"NASA, SDO; Processing: Alan Watson via Helioviewer",
      "date":"2018-10-10",
      "description":"Sometimes, the surface of our Sun seems to dance. In the middle of 2012, for example, NASA's Sun-orbiting Solar Dynamic Observatory spacecraft imaged an impressive prominence that seemed to perform a running dive roll like an acrobatic dancer. The dramatic explosion was captured in ultraviolet light in the featured time-lapse video covering about three hours. A looping magnetic field directed the flow of hot plasma on the Sun. The scale of the dancing prominence is huge -- the entire Earth would easily fit under the flowing arch of hot gas. A quiescent prominence typically lasts about a month, and may erupt in a Coronal Mass Ejection (CME) expelling hot gas into the Solar System. The energy mechanism that creates a solar prominence is still a topic of research. Unlike 2012, this year the Sun's surface is significantly more serene, featuring fewer spinning prominences, as it is near the minimum in its 11-year magnetic cycle.",
      "image_thumbnail":[
         "image/?image=https://img.youtube.com/vi/hQFEHH5E69s/0.jpg&width=480",
         "image/?image=https://img.youtube.com/vi/hQFEHH5E69s/0.jpg&width=240"
      ],
      "media_type":"video",
      "thumbnail_url":"https://img.youtube.com/vi/hQFEHH5E69s/0.jpg",
      "title":"Sun Dance",
      "url":"https://www.youtube.com/embed/hQFEHH5E69s?rel=0"
   },
   {
      "apod_site":"https://apod.nasa.gov/apod/ap181009.html",
      "copyright":"Hubble Legacy Archive, NASA, ESA; Processing &  Domingo Pestana & Raul Villaverde",
      "date":"2018-10-09",
      "description":"Many spiral galaxies have bars across their centers. Even our own Milky Way Galaxy is thought to have a modest central bar. Prominently barred spiral galaxy NGC 1672, featured here, was captured in spectacular detail in an image taken by the orbiting Hubble Space Telescope. Visible are dark filamentary dust lanes, young clusters of bright blue stars, red emission nebulas of glowing hydrogen gas, a long bright bar of stars across the center, and a bright active nucleus that likely houses a supermassive black hole. Light takes about 60 million years to reach us from NGC 1672, which spans about 75,000 light years across. NGC 1672, which appears toward the constellation of the Dolphinfish (Dorado), is being studied to find out how a spiral bar contributes to star formation in a galaxy's central regions.",
      "hdurl":"https://apod.nasa.gov/apod/image/1810/NGC1672_Hubble_3600.jpg",
      "image_thumbnail":[
         "image/?image=https://apod.nasa.gov/apod/image/1810/NGC1672_Hubble_1080.jpg&width=480",
         "image/?image=https://apod.nasa.gov/apod/image/1810/NGC1672_Hubble_1080.jpg&width=240"
      ],
      "media_type":"image",
      "title":"NGC 1672: Barred Spiral Galaxy from Hubble",
      "url":"https://apod.nasa.gov/apod/image/1810/NGC1672_Hubble_1080.jpg"
   },
   {
      "apod_site":"https://apod.nasa.gov/apod/ap181008.html",
      "copyright":"Fritz Helmut Hemmerich",
      "date":"2018-10-08",
      "description":"Small bits of this greenish-gray comet are expected to streak across Earth's atmosphere tonight. Specifically, debris from the eroding nucleus of Comet 21P / Giacobini-Zinner, pictured, causes the annual Draconids meteor shower, which peaks this evening. Draconid meteors are easy to enjoy this year because meteor rates will likely peak soon after sunset with the Moon's glare nearly absent. Patience may be needed, though, as last month's passing of 21P near the Earth's orbit is not expected to increase the Draconids' normal meteor rate this year of (only) a few meteors per hour. Then again, meteor rates are notoriously hard to predict, and the Draconids were quite impressive in 1933, 1946, and 2011. Featured, Comet 21P gracefully posed between the Rosette (upper left) and Cone (lower right) nebulas two weeks ago before heading back out to near the orbit of Jupiter, to return again in about six and a half years.",
      "hdurl":"https://apod.nasa.gov/apod/image/1810/Comet21P_Hemmerich_1440.jpg",
      "image_thumbnail":[
         "image/?image=https://apod.nasa.gov/apod/image/1810/Comet21P_Hemmerich_960.jpg&width=480",
         "image/?image=https://apod.nasa.gov/apod/image/1810/Comet21P_Hemmerich_960.jpg&width=240"
      ],
      "media_type":"image",
      "title":"Comet 21P Between Rosette and Cone Nebulas",
      "url":"https://apod.nasa.gov/apod/image/1810/Comet21P_Hemmerich_960.jpg"
   },
   {
      "apod_site":"https://apod.nasa.gov/apod/ap181007.html",
      "copyright":"Cary & Michael Huang",
      "date":"2018-10-07",
      "description":"What does the universe look like on small scales? On large scales? Humanity is discovering that the universe is a very different place on every proportion that has been explored. For example, so far as we know, every tiny proton is exactly the same, but every huge galaxy is different. On more familiar scales, a small glass table top to a human is a vast plane of strange smoothness to a dust mite -- possibly speckled with cell boulders. Not all scale lengths are well explored -- what happens to the smallest mist droplets you sneeze, for example, is a topic of active research -- and possibly useful to know to help stop the spread of disease. The featured interactive flash animation, a modern version of the classic video Powers of Ten, is a new window to many of the known scales of our universe. By moving the scroll bar across the bottom, you can explore a diversity of sizes, while clicking on different items will bring up descriptive information.",
      "media_type":"other",
      "title":"The Scale of the Universe - Interactive"
   },
   {
      "apod_site":"https://apod.nasa.gov/apod/ap181006.html",
      "copyright":"Mia Stalnacke",
      "date":"2018-10-06",
      "description":"What does an aurora look like to a frog? \"Awesome!\" is the likely answer, suggested by this imaginative snapshot taken on October 3rd from Kiruna, Sweden. Frequented by apparitions of the northern lights, Kiruna is located in Lapland north of the Arctic Circle, and often under the auroral oval surrounding planet Earth's geomagnetic north pole. To create a tantalizing view from a frog's perspective the photographer turned on the flashlight on her phone and placed it on the ground facing down, resting her camera's lens on top. The \"diamonds\" in the foreground are icy pebbles right in front of the lens, lit up by the flashlight. Reflecting the shimmering northern lights, the \"lake\" is a frozen puddle on the ground. Of course, in the distance is the Bengt Hultqvist Observatory.",
      "hdurl":"https://apod.nasa.gov/apod/image/1810/AuroraFrogStalnacke3072.jpg",
      "image_thumbnail":[
         "image/?image=https://apod.nasa.gov/apod/image/1810/AuroraFrogStalnacke1024.jpg&width=480",
         "image/?image=https://apod.nasa.gov/apod/image/1810/AuroraFrogStalnacke1024.jpg&width=240"
      ],
      "media_type":"image",
      "title":"Aurora: The Frog's View",
      "url":"https://apod.nasa.gov/apod/image/1810/AuroraFrogStalnacke1024.jpg"
   },
   {
      "apod_site":"https://apod.nasa.gov/apod/ap181005.html",
      "copyright":"Radu-Mihai Anghel",
      "date":"2018-10-05",
      "description":"That's not a young crescent Moon poised above the hills along the western horizon at sunset. It's Venus in a crescent phase. About 54 million kilometers away and less than 20 percent illuminated, it was captured by telescope and camera on September 30 near Bacau, Romania. The bright celestial beacon is now languishing in the evening twilight, its days as the Evening Star in 2018 coming to a close. But it also grows larger in apparent size and becomes an ever thinner crescent in telescopic views. Heading toward an inferior conjunction (non-judgmental), the inner planet will be positioned between Earth and Sun on October 26 and lost from view in the solar glare. At month's end a crescent Venus will reappear in the east though, rising just before the Sun as the brilliant Morning Star.",
      "hdurl":"https://apod.nasa.gov/apod/image/1810/Venus_Radu-Mihai_MG_3429.jpg",
      "image_thumbnail":[
         "image/?image=https://apod.nasa.gov/apod/image/1810/Venus_Radu-Mihai_MG_3429_1067px.jpg&width=480",
         "image/?image=https://apod.nasa.gov/apod/image/1810/Venus_Radu-Mihai_MG_3429_1067px.jpg&width=240"
      ],
      "media_type":"image",
      "title":"The Last Days of Venus as the Evening Star",
      "url":"https://apod.nasa.gov/apod/image/1810/Venus_Radu-Mihai_MG_3429_1067px.jpg"
   }
]
```

### Dependencies
- Node.js - https://nodejs.org/en/
- Cheerio - https://cheerio.js.org/
- Express.js - https://expressjs.com/
- request - https://www.npmjs.com/package/request
- sharp - https://www.npmjs.com/package/sharp
- iconv-lite - https://github.com/ashtuchkin/iconv-lite
