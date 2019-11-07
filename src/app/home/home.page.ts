import { Component } from '@angular/core';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { ImageService } from '../services/image.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public safeImg;

  constructor(public imageService: ImageService, private webview: WebView, private platform: Platform) {
  }

  async ngOnInit() {
    const secureImage = await this.imageService.getSecurelyStoredImage();
    if (secureImage !== null) {
      console.log("got saved image");
      this.safeImg = secureImage;
    }
    else {
      if (this.platform.is("cordova")) {
        this.safeImg = this.webview.convertFileSrc("assets/image-placeholder.jpg");
      } else {
        this.safeImg = "assets/image-placeholder.jpg";
      }
    }
  }

  async captureImage() {
    let image = await this.imageService.captureNewImage();
    this.safeImg = image;
  }

  async loadImageFromSecureStorage() {
    let image = await this.imageService.getImageUsingObjectUrl();
    this.safeImg = image;
  }
}
