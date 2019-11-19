import { Injectable } from '@angular/core';
import {
  CordovaEngine,
  Database,
  DatabaseConfiguration,
  IonicCBL,
  MutableDocument,
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

  // Open the user's camera on device, convert the photo bits to 
  // an ArrayBuffer, then save to Offline Storage.
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
    const webSafePhoto = this.webview.convertFileSrc(tempPhoto);
    const response = await fetch(webSafePhoto);
    const photoArrayBuffer = await response.arrayBuffer();

    const blob = new Blob("image/jpeg", photoArrayBuffer);
    const imageDoc = new MutableDocument(this.DOC_NAME);
    imageDoc.setBlob(this.DOC_BLOB_NAME, blob);

    await this.database.save(imageDoc);

    // Display the image immediately. Held in temporary storage, so the OS will clear 
    // out eventually. When the user loads the app at a later time, the encrypted image 
    // is retrieved securely from Offline Storage and displayed instead.
    return this.sanitizer.bypassSecurityTrustUrl(webSafePhoto);
  }

  // Retrieve the encrypted image from Offline Storage then display as a 
  // base64 image stream
  public async getImageAsBase64() {
    await this.readyPromise;

    const imageDoc = await this.database.getDocument(this.DOC_NAME);
    if (imageDoc === null) {
      return null;
    }

    return new Promise((resolve) => {
      imageDoc.getBlobContent(this.DOC_BLOB_NAME, this.database).then((docBlob) => {
        const bytes = new Uint8Array(docBlob);
        const blob = new window.Blob([bytes.buffer], { type: "image/jpeg"});

        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      });
    });
  }

  // Retrieve the encrypted image from Offline Storage then display as a 
  // object URL
  public async getImageAsObjectUrl() {
    await this.readyPromise;

    const imageDoc = await this.database.getDocument(this.DOC_NAME);
    if (imageDoc === null) {
      return null;
    }

    const docBlob = await imageDoc.getBlobContent(this.DOC_BLOB_NAME, this.database);
    const arrayBufferView = new Uint8Array(docBlob);
    const blob = new window.Blob([ arrayBufferView.buffer ], { type: "image/jpeg"});
    const objectUrl = window.URL.createObjectURL(blob);
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
