
/* dependencies */
var Blob = require('blob');

module.exports = getImageSource;

var lastURL;

function getImageSource(imageData) {
  // revokes the url if we made it with blob constructor
  function cleanLastURL() {
    if (lastURL) {
      URL.revokeObjectURL(lastURL);
    }
  }

  if (Blob) {
    var blob = new Blob([imageData], {type: 'image/png'});
    var url = URL.createObjectURL(blob);
    cleanLastURL();
    lastURL = url;
    return url;
  } else if (imageData.base64) {
    var url =  'data:image/png;base64,' + imageData.data;
    cleanLastURL();
    return url;
  } else {
    throw new Error("can't construct Blobs but data not base64");
  }
}
