# iOS location privacy

Rehearsal Room and the other portfolio apps do not use device location. Do not add a location purpose string describing a feature the apps do not provide.

Apple's ITMS-90683 warning for Rehearsal Room build 4 was traced to the bundled `OneSignalLocation.framework`. The installed `react-native-onesignal` 5.5.14 dependency includes that optional module by default. Its supported `ONESIGNAL_DISABLE_LOCATION=true` build flag excludes the module while retaining notifications and in-app messages.

Every EAS build profile now sets this flag, either directly or through inheritance. CI sets it too. The simulator profile inherits the production Rehearsal Room environment. Generate native projects from Expo configuration as usual; do not edit generated native files or installed SDK code.

For local CocoaPods or Gradle builds, export the same environment variable before resolving dependencies or launching the IDE. An existing CocoaPods lockfile may retain the location module, so regenerate the generated native project or reinstall its pods without the old location dependency. EAS replacement builds must use `--clear-cache`.

Before uploading a replacement IPA, verify that its app and extension bundles do not contain `OneSignalLocation.framework`, that native binaries do not reference `CLLocationManager` or location authorization selectors, and that microphone access remains declared. A JavaScript export alone cannot confirm native dependency removal.

Uploading a build does not automatically replace an active App Review submission. Inspect the review state first. Preserve an active review if the issue is only an accepted-delivery warning; use the corrected binary for a rejected submission or the next delivery as appropriate.

References:

- https://github.com/OneSignal/react-native-onesignal#disable-location-module
- https://developer.apple.com/documentation/uikit/requesting-access-to-protected-resources
