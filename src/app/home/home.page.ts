import { Component } from '@angular/core';
import { ImageService } from '../services/image.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public safeImg;

  constructor(public imageService: ImageService) {
    
  }

  ngOnInit() {

  }

  async loadImage() {
    let image = await this.imageService.getImageUsingObjectUrl();
    console.log("setting image to display");
    this.safeImg = image;
  }
}
