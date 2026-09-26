import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { APP_IDS, AppId, brands } from '../../shared/catalog';
const extra = Constants.expoConfig?.extra || {};
const q =
  Platform.OS === 'web' && typeof window !== 'undefined' && extra.portfolioPreview
    ? new URLSearchParams(window.location.search).get('app')
    : null;
export const appId: AppId = APP_IDS.includes(q as AppId)
  ? (q as AppId)
  : APP_IDS.includes(extra.variant)
    ? extra.variant
    : 'rehearsal';
export const brand = brands[appId];
export const config = {
  apiUrl:
    process.env.EXPO_PUBLIC_API_URL ||
    (Platform.OS === 'web'
      ? ''
      : Platform.OS === 'android'
        ? 'http://10.0.2.2:8787'
        : 'http://localhost:8787'),
  revenueCatIosKey: String(extra.revenueCatIosKey || ''),
  revenueCatAndroidKey: String(extra.revenueCatAndroidKey || ''),
  oneSignalAppId: String(extra.oneSignalAppId || ''),
  layersAppId: String(extra.layersAppId || ''),
  supportEmail: String(extra.supportEmail || ''),
  legalOrigin: String(extra.legalOrigin || ''),
  operatorName: String(extra.operatorName || ''),
  hostingRegion: String(extra.hostingRegion || ''),
  backupRetentionDays: String(extra.backupRetentionDays || ''),
};
