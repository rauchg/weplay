
module.exports = getImageSource;

var blobStyle = null;
var BlobBuilder;

function getImageSource(imageData, type) {
  var blob = getImageBlob(imageData, type);
  if ('string' == typeof blob) {
    var src = 'data:' + type + ';base64,' + blob; // base 64
    return src;
  } else {
    return URL.createObjectURL(blob);
  }
}

function getImageBlob(imageData, type) {
  if (!blobStyle)
    blobStyle = getBlobStyle();

  if (blobStyle == 'con') {
    return new Blob(imageData, {type: type});
  } else if (blobStyle == 'bb') { // blobbuilder
    var bb = new BlobBuilder();
    bb.append(imageData);
    return bb.getBlob(type);
  } else { // base64
    var dataObj = data[0];
    if (dataObj.base64) {

    } else {
      throw new Error("can't construct Blobs but data not base64");
    }
  }
}

function getBlobStyle() {
  var data = ['a'];
  var type = {type: 'text/html'};
  var blob;

  try {
    blob = new Blob(data, type);
    return 'con';
  } catch (e) {
    BlobBuilder = window.BlobBuilder || 
                      window.WebKitBlobBuilder || 
                      window.MozBlobBuilder || 
                      window.MSBlobBuilder;
    if (e.name == 'TypeError' && BlobBuilder) {
      return 'bb';
    } else {
      return 'b64';
    }
  }
}