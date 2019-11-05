import { Component, SecurityContext, ChangeDetectorRef } from '@angular/core';
import { ImageService } from '../services/image.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public safeImg;

  constructor(public imageService: ImageService, private sanitizer: DomSanitizer, 
    private changeDetectorRef: ChangeDetectorRef) {
    
  }

  ngOnInit() {

  }

  async loadImage() {
    let image = await this.imageService.getImage();
    this.safeImg = this.sanitizeImage(image);

    // this may be causing the WebKitBlobResource error 1 issue
    //URL.revokeObjectURL(image);

    // setTimeout(() => {
    //   this.changeDetectorRef.detectChanges();
    // }, 2000);
    
    //this.safeImg = image;
    //console.log("got safe image: " + this.safeImg);
  }

  sanitizeImage(imagePath) {
    // blob:http://localhost/b3b9c98f-ecc2-4e41-9f1d-b08a25dc1961
    return this.sanitizer.bypassSecurityTrustUrl(imagePath);
  }

}
