import { Component } from '@angular/core';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public safeImg = null;

  constructor(public imageService: ImageService) {
  }

  async ngOnInit() {
    const secureImage = await this.imageService.getSecurelyStoredImage();
    if (secureImage !== null) {
      this.safeImg = secureImage;
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

  async deleteImage() {
   await this.imageService.deleteImage();
   this.safeImg = null;
  }
}
