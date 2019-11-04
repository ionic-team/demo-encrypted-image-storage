import { Component } from '@angular/core';
import { ImageService } from '../services/image.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public safeImg;

  constructor(private imageService: ImageService, private sanitizer: DomSanitizer) {
    
  }

  ngOnInit() {

  }

  async loadImage() {
    this.safeImg = this.sanitizeImage(await this.imageService.getImage());
    console.log("got safe image");
  }

  sanitizeImage(imagePath) {
    return this.sanitizer.bypassSecurityTrustUrl(imagePath);
  }

}
