# Encrypted Image Storage (Powered by Ionic Native)

Demo app used during the ["Ionic Native: Native-powered apps, without the hassle"](https://ionicframework.com/resources/webinars/ionic-native-native-powered-apps-without-hassle) webinar.

The real world use case covered in this app is sensitive document management. For example, if the app stores a scanned driver license or id, this sensitive user information should be protected (via encryption) on the user's device.

Built for iOS and Android.

> Note: This demo requires an Ionic Native key to install, build, and run. Ionic Native includes a reliable set of Native solutions and plugins that you can use in your Ionic app, quality controlled and maintained by the Ionic Team. If you are interested in acquiring a key or learning more, please [contact us](https://ionicframework.com/enterprise/contact?utm_source=code&utm_medium=github&utm_campaign=webinar%20ionic%20native%20no%20hassles).

## How It Works

When the user taps the `Scan Id` button, the device camera opens and the user takes a picture. The image is encrypted and stored on the user's device. Then, it's displayed on the screen, along with the details from the driver's license (Note that the image recognition portion is faked here - that feature is outside the scope of this example).

### Technical Implementation:

After the app is opened, a client-side GUID (unique to the app user) is generated then stored in secure storage, encrypted at-rest on the device using the [Ionic Identity Vault](https://ionicframework.com/docs/enterprise/identity-vault) solution. In the demo, there’s no login screen, but in a real app the GUID would be generated after the user logged in, thus tying an encryption key entirely unique to them. On subsequent app openings, the GUID is retrieved from IV’s secure storage.

Offline Storage is configured using the GUID as the encryption key for the database. When a new photo is captured via the Camera plugin, it's placed into offline storage encrypted at rest.

As a bonus, Identity Vault's screen protection feature is enabled (`hideScreenOnBackground: true`) which automatically hides the sensitive user info whenever the app is placed in the background.

### Feature Overview:

* Taking pictures: Ionic Native premier [Camera plugin](https://ionicframework.com/docs/enterprise/camera)
* Reading the Photo file and converting it to an ArrayBuffer: [Fetch Web API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
* Storing the encrypted photo images and user data: [Ionic Offline Storage](https://ionicframework.com/docs/enterprise/offline-storage)
* Automatically securing the encryption GUID in Apple Keychain and Android Keystore: [Ionic Identity Vault](https://ionicframework.com/docs/enterprise/identity-vault)

## Project Structure

* ImageService (`src/app/services/image.service.ts`): Logic encapsulating Ionic Offline Storage solution and Camera plugin.
* IdentityService (`src/app/services/identity.service.ts`): Logic encapsulating dynamic GUID generation for encrypting photos.
* Home module (`src/app/home`): UI code.

## How to Run

0) Install Ionic if needed: `npm install -g ionic`.
1) Clone this repository.
2) In a terminal, change directory into the repo: `cd demo-encrypted-image-storage`.
3) Register your Ionic Native key: `ionic enterprise register`.
4) Install all packages: `npm install`.
5) Build and [run on a device](https://ionicframework.com/docs/building/running).