import { Component } from '@angular/core';
import { ImageService } from '../services/image.service'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private imageService: ImageService) {
    
  }

  ngOnInit() {

  }

}
