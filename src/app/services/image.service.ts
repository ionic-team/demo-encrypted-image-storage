import { Injectable } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File, Entry } from '@ionic-native/file/ngx';
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
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private database: Database;
  private readyPromise: Promise<void>;
  private savedDoc: MutableDocument;
  
  constructor(private camera: Camera, private file: File, private webview: WebView) { 
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
    
    try {
      let fileEntry = await this.file.resolveLocalFilesystemUrl(capturedTempImage) as any;
      fileEntry.file((file) => {
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
          console.log("file loaded");
          let blob = new Blob("image/jpeg", fileReader.result as ArrayBuffer);
          this.savedDoc = new MutableDocument();
          this.savedDoc.setBlob("test", blob);

          try {
            this.database.save(this.savedDoc);
            console.log("saved doc");
          } catch (err) {
            console.error(err);
          }
        }
        
        fileReader.readAsArrayBuffer(file);
      });
    } catch(err) {
      console.log(err);
    }
  }

  public async getImage() {
    let docBlob = await this.savedDoc.getBlobContent("test", this.database);
    var arrayBufferView = new Uint8Array(docBlob);
    var blob = new window.Blob([ arrayBufferView ]);
    var objectUrl = window.URL.createObjectURL(blob);
    console.log(objectUrl);
    //let webViewImage = this.webview.convertFileSrc(objectUrl);
    //console.log("webv: " + webViewImage);
    return objectUrl;
  }

    /*
  public imageDataToBlob(imageData): Observable<any> {

    return Observable.fromPromise(this.file.resolveLocalFilesystemUrl(imageData))
        .flatMap((fileEntry: FileEntry) => { // Cast entry to fileEntry.
            return this.fileEntryToObservable(fileEntry)
        })
        .flatMap((file) => {
            return this.fileReaderToObservable(file)
        });
  }

public fileEntryToObservable(fileEntry: any): Observable<any> {

    return Observable.create(observer => {
        // Success.
        fileEntry.file(function(file) {
            observer.next(file);
        },
        // Error.
        function (error) {
            observer.error(error)
        })
    });
}

public fileReaderToObservable(file: any): Observable<any> {

  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(file);

  return Observable.create(observer => {
      // Success.
      fileReader.onload = ev => {
          let formData = new FormData();
          //let imgBlob = new Blob([fileReader.result], { type: file.type });
          //observer.next(imgBlob);
      }
      // Error.
      fileReader.onerror = error => observer.error(error);
  });
  }*/

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
