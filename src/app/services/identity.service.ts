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
       (await this.getVault()).storeValue(this.KEY_OFFLINE_STORAGE, guid);
     }

     return guid;
   }

   private createRandomGuid() {
    var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var i;
    var result = "";

    if(window.crypto && window.crypto.getRandomValues)
    {
      const values = new Uint32Array(length);
      window.crypto.getRandomValues(values);
      for(i=0; i<length; i++)
      {
          result += charset[values[i] % charset.length];
      }
      return result;
    }
    else
    {
        // Use Math.random approach, like in Opera browser
        // Opera's Math.random is secure, see http://lists.w3.org/Archives/Public/public-webcrypto/2013Jan/0063.html
        for(i = 0; i < length; i++)
        {
          result += charset[Math.floor(Math.random()*charset.length)];
        }
        return result;
    }
  }
}
