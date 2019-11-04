import { Injectable } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import {
  CordovaEngine,
  Database,
  DatabaseConfiguration,
  DataSource,
  IonicCBL,
  Meta,
  MutableDocument,
  Ordering,
  QueryBuilder,
  SelectResult,
  Expression,
  Blob
} from '@ionic-enterprise/offline-storage';
import { WebView } from '@ionic-native/ionic-webview/ngx';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private database: Database;
  private readyPromise: Promise<void>;
  
  constructor(private camera: Camera, private webview: WebView) { 
    this.readyPromise = this.initializeDatabase();
  }

  public async saveImage() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    const capturedTempImage = await this.camera.getPicture(options);
    const webVersionImage = this.webview.convertFileSrc(capturedTempImage);
    
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", webVersionImage, false);
      xhr.responseType = "arraybuffer";
      xhr.onload = function(oEvent) {    };
      xhr.send();

      let blob = new Blob("image/jpeg", xhr.response);
      
      let doc = new MutableDocument();
      doc.setBlob("test", blob);

      try {
        this.database.save(doc);
        console.log("saved doc");
      } catch (err) {
        console.error(err);
      }
    } catch(err) {
      console.log(err);
    }
  }

  public async getImage() {

    let doc = new MutableDocument();
    try {
    // this returns an empty ArrayBuffer
    let docBlob = await doc.getBlobContent("test", this.database);
    
    // this returns undefined:
    //let bits = await doc.getBlob("test").toDictionary();
    //console.log("content type: " + bits.contentType);
    //console.log("nums " + bits.data);
    console.log("retrieved blob: " + docBlob);

    return this.arrayBufferToBase64(docBlob);
    }
    catch (err) {
      console.log("err: " + err);
    }
  }

  private arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
     // Converts arraybuffer to typed array object
    const typedArray = new Uint8Array(arrayBuffer);
    // length is zero!
    console.log("typed length: " + typedArray.length);

    // converts the typed array to string of characters
    const STRING_CHAR = String.fromCharCode.apply(null, typedArray);
  
    //converts string of characters to base64String
    let base64String = btoa(STRING_CHAR);
    console.log(base64String);

    return `data:image/jpg;base64, ${base64String}`;
  }

  private _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    console.log("length: " + len);
    for (var i = 0; i < len; i++) {
       binary += String.fromCharCode( bytes[ i ] );
    }
    let base64String = btoa(binary);
    console.log(base64String);
    return `data:image/jpg;base64, ${base64String}`;
  }

  private async initializeDatabase(): Promise<void> {
    return new Promise(resolve => {
      IonicCBL.onReady(async () => {
        //todo: IV get encryption key
        // if not there, create one

        const config = new DatabaseConfiguration();
        config.setEncryptionKey('8e31f8f6-60bd-482a-9c70-69855dd02c38');
        this.database = new Database('employees', config);
        this.database.setEngine(
          new CordovaEngine({
            allResultsChunkSize: 9999
          })
        );
        await this.database.open();

        resolve();
      });
    });
  }
}
