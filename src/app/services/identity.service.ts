import { Injectable } from '@angular/core';
import {
  AuthMode,
  IonicIdentityVaultUser,
  DefaultSession
} from '@ionic-enterprise/identity-vault';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class IdentityService extends IonicIdentityVaultUser<DefaultSession> {

  private KEY_OFFLINE_STORAGE = "os_encryption";

  constructor(public platform: Platform) {
    super(platform, {
      authMode: AuthMode.SecureStorage,
      restoreSessionOnReady: true,
      unlockOnReady: true,
      unlockOnAccess: true,
      lockAfter: 5000,
      hideScreenOnBackground: true
    });
   }

   // Retrieve encryption key from the Vault. 
   // If not found, generate a new one then store it securely.
   public async getEncryptionKey() {
     let guid = await (await this.getVault()).getValue(this.KEY_OFFLINE_STORAGE);

     if (!guid) {
       guid = this.createRandomGuid();
       console.log("created new GUID");
       (await this.getVault()).storeValue(this.KEY_OFFLINE_STORAGE, guid);
     }

     return guid;
   }

   private createRandomGuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
  }
}
