var Fuse = require("fuse.js");
var mime = require('mime-types');
var request = require('request');
bot.dialog('FindPlaceDialog', (session, args, next) => {
        let API_URL = "http://diningdata.itg.gatech.edu/api/DiningLocations";
        let input = session.message.text;
        let entities = args.intent.entities;
        let placeType = session.message.text;
        for (let i in entities) {
            if (entities[i].type === "Places.PlaceType") {
                placeType = entities[i].entity;
                break;
            }
        }
        session.send('Okay, I will look for a %s on campus.', placeType);
        request.get(API_URL,  function(error, response, body) {
                let locations = JSON.parse(body);
                var fuse = new Fuse(locations, {
                  shouldSort: true,
                  threshold: 0.6,
                  location: 0,
                  distance: 100,
                  maxPatternLength: 32,
                  minMatchCharLength: 1,
                  keys: [
                    "Name",
                    "Description"
                  ]
                });
                let results = fuse.search(placeType);
                let result;
                if (!results.length) {
                    result = locations[Math.floor(Math.random()*locations.length)];
                    session.send("Sorry, I couldn't find a %s around campus. But that's okay! I will randomly select a great place to eat instead.", input);
                }
                else {
                    result = results[0];
                }
                session.send("I found a %s around campus.", result.Name);
                session.send({
                    text: "I found a " + result.Name + " around campus.",
                    attachments: [
                        {
                            contentType: mime.lookup(result.LogoURL),
                            contentUrl: result.LogoURL,
                            name: result.Name
                        }
                    ]
                });
                session.send("Description: %s.\n\n Location: %s", result.Description, result.LocationDetails);
                session.send("Get directions to %s: https://www.google.com/maps?q=%s,%s", result.Name, result.Latitude, result.Longitude);

                session.endDialog();
          });


    }
).triggerAction({
    matches: 'Places.FindPlace'
});
