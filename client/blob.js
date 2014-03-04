
/* dependencies */
var Blob = require('blob');

module.exports = getImageSource;

var blobStyle = null;
var BlobBuilder;

function getImageSource(imageData) {
  if (Blob) {
    var blob = new Blob([imageData], {type: 'image/png'});
    return URL.createObjectURL(blob);
  } else if (imageData.base64) {
    return 'data:image/png;base64,' + imageData.data
  } else {
    throw new Error("can't construct Blobs but data not base64");
  }
}
