/*
 * Get JSON metadata for a DPLA item
 * @hint {String} either a DPLA url or item ID
 * @callback {Function} callback that receives the JavaScript object
 * @fileNameOnCommons {String} optional; file name of image on Commons
 * @bareCitation {Boolean} optional; if true, don't wrap in <ref> tags,
 *                         defaults to false
 */

function wikidpla(url, callback, fileNameOnCommons, bareCitation) {

  function clean(s) {
    return s.replace(/ ?[.;:]$/, '');
  }

  // figure out the json view URL for the dpla item
  var jsonUrl = null;
  if (url.match(/^http:\/\/(www\.)?dp.la\/item\//)) {
    jsonUrl = url + ".json";
  } else {
    jsonUrl = "http://dp.la/item/" + url + ".json";
  }

  $.ajax({url: jsonUrl, dataType: "jsonp", success: function(data) {
    var item = data.sourceResource;

    // get the id, but strip off unnecessary text
    var id = item.reproduction_number.split(" ")[0];

    // get the handle url
    var url = item.resource_links[0]; 

    // squash the creators down
    var creators = sourceResource.creator(function(c) {return c.title}).join(", ");

    // the repository, trim off address if present
    var repository = item.repository || "Library of Congress Prints and Photographs Division";
    var match = repository.match(/(.+) Washington/);
    if (match) repository = match[1];
    
    // get medium, but strip off numbers and capitalize for citation style
    var medium = clean(item.medium_brief.replace(/^\d+\s/,"")).charAt(0).toUpperCase() + clean(item.medium_brief.replace(/^\d+\s/,"")).slice(1);
    
    // sanitize fileNameOnCommons if given; if not given, defaults to empty string
    var cleanFileName = "";
    if (typeof fileNameOnCommons !== 'undefined' && fileNameOnCommons !== '') {
      if (fileNameOnCommons.search(/[\#\<\>\[\]\|\{\}]/) == -1) {
        cleanFileName = fileNameOnCommons.replace(/^File:/, "");
      } else {
        cleanFileName = "<!-- Invalid file name provided! -->"
      }
    }

    // bareCitation defaults to false (i.e., add <ref> wrapper)
    if (typeof(bareCitation) == 'undefined')
      bareCitation = false;

    // generate wikitext from the dpla metadata
    item.wikitext = ((bareCitation ? '' : '<ref group="image">') + 
                     '{{User:Dominic/Cite|title=' + item.title +
                     '|creator=' + creators +
                     '|medium=' + medium +
                     '|id=' + id +
                     '|url=' + url +
                     '|repository=' + repository +
                     '|date=' + clean(item.date) +
                     '|file=' + cleanFileName +
                     '}}' +
                     (bareCitation ? '' : '</ref>'));
    callback(item);
  }});
}
