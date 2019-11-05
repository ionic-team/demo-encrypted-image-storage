import { Component, SecurityContext } from '@angular/core';
import { ImageService } from '../services/image.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public safeImg;

  constructor(public imageService: ImageService, private sanitizer: DomSanitizer) {
    
  }

  ngOnInit() {

  }

  async loadImage() {
    let image = await this.imageService.getImage();
    this.safeImg = this.sanitizeImage(image);
    //this.safeImg = image;
    console.log("got safe image: " + this.safeImg);
  }

  sanitizeImage(imagePath) {
    return this.sanitizer.sanitize(SecurityContext.URL, imagePath);
    //return this.sanitizer.bypassSecurityTrustUrl(imagePath);
  }

}
