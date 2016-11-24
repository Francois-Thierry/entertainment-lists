// update header github link
$(".header-button.github").attr("href", "https://github.com/Francois-Thierry/entertainment-lists/tree/gh-pages")

$.getJSON("entertaining_things.json", function(data) {

////////////////////////////////////////////////////////////////////////////////
///                                                          Main Javascript ///
////////////////////////////////////////////////////////////////////////////////

  var types = ["films", "series", "books"]

  var typeOnFocus = "films";
  updateType();

  function updateType() {
    var container = $(".row.plot .list");
    // keep paper plot container height
    // $(".row.plot.list").css("min-height", $(".row.plot.list").height());
    container.html("");
    var fourItems = shuffle(data[typeOnFocus]).slice(0, 8);
    for (var i in fourItems) {
      if (typeOnFocus != "books") {
        queryUrl = fourItems[i].image;
        // remove "CR" tag to get uncropped images from IMdB and homogenize quality
        var queryUrl = queryUrl.replace("CR", "")//.replace(".jpg", "_UX250_.jpg");
      } else {
        var queryUrl = "https://cors-anywhere.herokuapp.com/"+fourItems[i].image;
      }
      container.append('<a target="_blank" href="'+fourItems[i].ref+'"><img class="poster" src="'+queryUrl+'" crossOrigin="Anonymous"></a>');
    }
  }

  $("h2").click(function(){
    $("h2").removeClass("active");
    typeOnFocus = $(this).text().toLowerCase();
    typeOnFocus = typeOnFocus.replace("é", "e").replace("livres", "books");
    $(this).addClass("active");
    // var top = $("h2").offset().top-15;
    // scrollTo(top, 1500);
    updateType();
  })

  $(".refresh-action").click(function(){
    // var top = $("h2").offset().top-15;
    // scrollTo(top, 1000);
    updateType();
  })


////////////////////////////////////////////////////////////////////////////////
///                                              Javascript for Modal Window ///
////////////////////////////////////////////////////////////////////////////////

  function checkItemExistence(data, id) {
    return data.filter(
      function(data){if (data.id == id){return data.title;}}
    );
  }

  // update button clicked!
  $(".button").click(function(){
    // reset output informations
    $("output").html("")
    // set-up valid fields array container
    var queryUrls = [];
    // iterate the form fields
    for (i=0; i < $(".form-group")["length"]; i++) {
      // if a field has a value (else do nothing)
      if ($(".form-group input")[i].value) {
        // extract the id the user entered
        var id = $(".form-group input")[i].value
        // get the type of id from the field label
        var type = $(".form-group label")[i].innerHTML;
        // check if the id already exists in the database
        var existenceCheck = checkItemExistence(data[type.toLowerCase()], $("input")[i].value);
        // if it doesn't exits
        if (existenceCheck.length == 0) {
          var queryUrl = "";
          // differenciate films and series that are on IMdB and books that are on Babelio
          if (type != "Books") {
            // check if the id is a valid IMdB format
            if ($("input")[i].value.match(/^tt\d{7}$/)) {
              // IMDb url for the item id 
              queryUrl = "http://www.imdb.com/title/"+$("input")[i].value;
              queryUrls.push("https://cors-anywhere.herokuapp.com/"+queryUrl);
            } else {
              $("output").append(type+" input isn't a valid IMdB id</br>");
              queryUrls.push("");
            }
          } else {
            // check if the id valid is a valid Babelio format
            if ($("input")[i].value.match(/^\d+$/)) { 
              // Babelio url for the item id
              queryUrl = "http://www.babelio.com/livres/*/"+$("input")[i].value;
              queryUrls.push("https://cors-anywhere.herokuapp.com/"+queryUrl);
            } else {
              $("output").append("Books input isn't a valid Babelio id</br>");
              queryUrls.push("");
              // return;
            }
          }
          // if queryUrl is defined the current id has the approriate format
          if (queryUrl) {
            $.ajax({
              type: 'GET',
              datatype: 'text',
              url: "https://cors-anywhere.herokuapp.com/"+queryUrl,
              // queryUrl is valid and we have a response from IMdB or Babelio
              success: function(response) {
                // actual index of the field under consideration
                var i = queryUrls.indexOf(this.url);
                // actual type of data
                var type = $(".form-group label")[i].innerHTML.toLowerCase();
                // prepare the item
                var item = {"id":$(".form-group input")[i].value};
                // get the item title
                var rawTitle = $(response).filter("meta[property='og:title']").attr("content");
                // if we have a valid response
                if (rawTitle) {                     
                  // get the source of the poster image
                  var imgSrc = $(response).filter("meta[property='og:image']").attr("content");
                  // get the reference to the IMdB or Babelio webpage
                  var linkUrl = $(response).filter("meta[property='og:url']").attr("content");
                  // adapt properties to differences between IMdB and Babelio
                  if (type != "books") {
                    // get the actual title of the item
                    var title = rawTitle.split(" (")[0];
                    // add year of first diffusion to the item properties
                    item["year"] = rawTitle.match(/\(.*(\d{4}).*\)/)[1];
                    // prepare genres keywords
                    var genres = [];
                    // get the item genres from the IMdB response
                    $(".itemprop[itemprop='genre']", $(response)).each(function(){genres.push(this.innerHTML)});
                    // add it to the item properties
                    item["genres"] = genres;
                  } else {
                      // get the actual title of the item
                      var title = rawTitle.split(" - ")[0];
                      // find book author
                      var rawAuthor = $(".livre_auteurs", $(response)).attr("href");
                      // add book author to the item properties
                      item["author"] = rawAuthor.split("/")[2].split("-").join(" ");
                      // get the item genre keywords
                      var keywords = $(response).filter("meta[name='keywords']").attr("content");
                      // add it to the item properties
                      item["keywords"] = keywords.split(",").slice(0, -1);
                    }
                  // update item properties
                  item["title"] = title;
                  item["ref"] = linkUrl;
                  item["image"] = imgSrc;
                  // add the item to the dataset
                  data[type].push(item);
                  // output addition
                  $("output").append(title+" added to the dataset</br>");
                  // reconstruct the data file to dowload
                  downloadFile(data);
                } else {
                    $("output").append("it seems that this book? doesn't exist</br>");
                }
              },
              error: function() {console.log("ERROR with "+queryUrl);}
            });
          }
        } else {
          $("output").append(existenceCheck[0].title+" already exists</br>");
          queryUrls.push("");
        }
      } else {
          queryUrls.push("");
        }
    }
  });

});