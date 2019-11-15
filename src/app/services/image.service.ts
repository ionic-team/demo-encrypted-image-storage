import { Injectable } from '@angular/core';
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
import { Camera, CameraOptions } from '@ionic-enterprise/camera/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { DomSanitizer } from '@angular/platform-browser';
import { IdentityService } from '../services/identity.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private database: Database;
  private readyPromise: Promise<void>;

  private DOC_NAME = "docSecureImage";
  private DOC_BLOB_NAME = "blobSecureImage";
  private DATABASE_NAME = "secureImageStorage";
  
  constructor(private camera: Camera, private webview: WebView, private sanitizer: DomSanitizer, 
    private identityService: IdentityService) { 
    this.readyPromise = this.initializeDatabase();
  }

  public async captureNewImage() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 600,
      targetHeight: 400
    }
    
    const tempPhoto = await this.camera.getPicture(options);
    const webVersionImage = this.webview.convertFileSrc(tempPhoto);
    
    try {
      console.log(tempPhoto);

      let response = await fetch(webVersionImage);
      console.log("fetch worked? " + response.ok);
      let ab = await response.arrayBuffer();
      console.log("got ab - length: " + ab.byteLength);

      let blob = new Blob("image/jpeg", ab);
      const imageDoc = new MutableDocument(this.DOC_NAME);
      imageDoc.setBlob(this.DOC_BLOB_NAME, blob);

      try {
        await this.database.save(imageDoc);
        console.log("saved doc success");
      } catch (err) {
        console.error(err);
      }

      /*let fileEntry = await this.file.resolveLocalFilesystemUrl(tempPhoto) as any;
      fileEntry.file((file) => {
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
          let blob = new Blob("image/jpeg", fileReader.result as ArrayBuffer);
          const imageDoc = new MutableDocument(this.DOC_NAME);
          imageDoc.setBlob(this.DOC_BLOB_NAME, blob);

          try {
            this.database.save(imageDoc);
          } catch (err) {
            console.error(err);
          }
        }
        
        fileReader.readAsArrayBuffer(file);
      });*/
    } catch(err) {
      console.log(err);
    }

    // Display the image immediately. Held in temporary storage, so the OS will clear 
    // out eventually. When the user loads the app at a later time, the encrypted image 
    // is retrieved securely from Offline Storage instead.
    const resolvedImg = this.webview.convertFileSrc(tempPhoto);
    return this.sanitizer.bypassSecurityTrustUrl(resolvedImg);
  }

  // Retrieve the encrypted image from Offline Storage then display as a 
  // base64 image stream
  public async getSecurelyStoredImage() {
    await this.readyPromise;

    const imageDoc = await this.database.getDocument(this.DOC_NAME);
    if (imageDoc === null) {
      return null;
    }

    return new Promise((resolve, reject) => {
      imageDoc.getBlobContent(this.DOC_BLOB_NAME, this.database).then((docBlob) => {
        var bytes = new Uint8Array(docBlob);
        var blob = new window.Blob([bytes.buffer], { type: "image/jpeg"});

        var reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      });
    });
  }

  // Retrieve the encrypted image from Offline Storage then display as a 
  // object URL
  public async getImageUsingObjectUrl() {
    await this.readyPromise;

    const imageDoc = await this.database.getDocument(this.DOC_NAME);
    if (imageDoc === null) {
      console.log("image not found");
      return null;
    }

    let docBlob = await imageDoc.getBlobContent(this.DOC_BLOB_NAME, this.database);
    var arrayBufferView = new Uint8Array(docBlob);
    var blob = new window.Blob([ arrayBufferView.buffer ], { type: "image/jpeg"});
    var objectUrl = window.URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustUrl(objectUrl);
  }

  // Delete the image document from Offline Storage
  public async deleteImage() {
    const imageDoc = await this.database.getDocument(this.DOC_NAME);
    await this.database.deleteDocument(imageDoc);
  }

  // Initialize the Offline Storage Couchbase Lite database
  // Use Identity Vault to create/get an encryption key unique to the app user.
  private async initializeDatabase(): Promise<void> {
    return new Promise(resolve => {
      IonicCBL.onReady(async () => {
        // Get (or create) a unique encryption key per user
        const config = new DatabaseConfiguration();
        config.setEncryptionKey(await this.identityService.getEncryptionKey());

        this.database = new Database(this.DATABASE_NAME, config);
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
