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
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private database: Database;
  private readyPromise: Promise<void>;
  private savedDoc: MutableDocument;
  
  constructor(private camera: Camera, private file: File, private webview: WebView, private sanitizer: DomSanitizer) { 
    this.readyPromise = this.initializeDatabase();
  }

  public async saveImage() {
    const options: CameraOptions = {
      quality: 10,  // 507,919 or 8,705,691
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

  public getImage() {
    return new Promise((resolve, reject) => {
      this.savedDoc.getBlobContent("test", this.database).then((docBlob) => {
        var bytes = new Uint8Array(docBlob);
        var blob = new window.Blob([bytes.buffer], { type: "image/jpeg"});

        var reader = new FileReader();
        reader.onloadend = () => {
          console.log("finished loading image. Length: " + (reader.result as string).length);
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      });
    });
  }

  public async getImageUsingObjectUrl() {
    let docBlob = await this.savedDoc.getBlobContent("test", this.database);
    var arrayBufferView = new Uint8Array(docBlob);
    var blob = new window.Blob([ arrayBufferView.buffer ], { type: "image/jpeg"});
    var objectUrl = window.URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustUrl(objectUrl);
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
