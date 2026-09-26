import { Platform } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { OneSignal } from 'react-native-onesignal';
import { LayersReactNative } from '@layers/expo';
import { router } from 'expo-router';
import { appId, config } from './config';
import { experimentVariant } from '../../shared/domain';
let rcReady = false,
  oneReady = false,
  currentId = '',
  layers: LayersReactNative | null = null,
  analyticsEnabled = false;
export async function initializeSdk(id: string) {
  const key = Platform.OS === 'ios' ? config.revenueCatIosKey : config.revenueCatAndroidKey;
  if (key) {
    if (!rcReady) {
      Purchases.configure({ apiKey: key, appUserID: id });
      rcReady = true;
    } else if (currentId !== id) await Purchases.logIn(id);
  }
  if (config.oneSignalAppId && !oneReady) {
    OneSignal.setConsentRequired(true);
    OneSignal.initialize(config.oneSignalAppId);
    OneSignal.Notifications.addEventListener('click', () => router.push('/reminders'));
    oneReady = true;
  }
  currentId = id;
}
const consent = (analyticsStorage: boolean) => ({
  analyticsStorage,
  adStorage: false,
  adUserData: false,
  adPersonalization: false,
});
export async function updateConsent(analytics: boolean, push: boolean, id: string) {
  analyticsEnabled = analytics;
  if (oneReady) {
    OneSignal.setConsentGiven(push);
    if (push) {
      OneSignal.login(id);
      OneSignal.User.pushSubscription.optIn();
    } else OneSignal.User.pushSubscription.optOut();
  }
  if (analytics && config.layersAppId) {
    if (!layers) {
      layers = new LayersReactNative({
        appId: config.layersAppId,
        environment: __DEV__ ? 'development' : 'production',
        appUserId: id,
        autoTrackDeepLinks: false,
        autoTrackExceptions: false,
        autoTrackAppOpen: false,
        autoTrackAppLifecycle: false,
      });
      await layers.setConsent(consent(true));
      await layers.init();
    }
    if (layers) {
      await layers.setConsent(consent(true));
      layers.setAppUserId(id);
      layers.setSuperProperties({
        app: appId,
        experiment: 'first_step_copy_v1',
        variant: experimentVariant(id),
      });
    }
  } else if (layers) {
    await layers.setConsent(consent(false));
    layers.reset();
    layers.shutdown();
    layers = null;
  }
}
export async function disconnectSdk() {
  analyticsEnabled = false;
  if (oneReady) {
    OneSignal.User.pushSubscription.optOut();
    OneSignal.logout();
    OneSignal.setConsentGiven(false);
  }
  if (layers) {
    await layers.setConsent(consent(false));
    layers.reset();
    layers.shutdown();
    layers = null;
  }
  if (rcReady) await Purchases.logOut();
  currentId = '';
}
export async function packages(): Promise<PurchasesPackage[]> {
  return rcReady ? (await Purchases.getOfferings()).current?.availablePackages || [] : [];
}
export async function buy(item: PurchasesPackage) {
  if (!rcReady) throw Error('Purchases are unavailable.');
  try {
    await Purchases.purchasePackage(item);
  } catch (e) {
    if ((e as { userCancelled?: boolean }).userCancelled)
      throw Error('Purchase cancelled. You have not been charged.');
    throw e;
  }
}
export async function restore() {
  if (!rcReady) throw Error('Purchases are unavailable.');
  await Purchases.restorePurchases();
}
export async function manageSubscription() {
  if (!rcReady) throw Error('Purchases are unavailable.');
  await Purchases.showManageSubscriptions();
}
export async function enablePush() {
  if (!oneReady) throw Error('Reminders are unavailable.');
  OneSignal.setConsentGiven(true);
  return OneSignal.Notifications.requestPermission(true);
}
export function trackSdk(name: string) {
  if (analyticsEnabled && layers) layers.track(name);
}
