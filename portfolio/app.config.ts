import type { ConfigContext, ExpoConfig } from 'expo/config';
import { APP_IDS, brands, AppId } from './shared/catalog.ts';
export default ({ config }: ConfigContext): ExpoConfig => {
  const id = (
      APP_IDS.includes(process.env.APP_VARIANT as AppId) ? process.env.APP_VARIANT : 'rehearsal'
    ) as AppId,
    b = brands[id],
    p = id.toUpperCase(),
    value = (key: string) => process.env[p + '_' + key] || '';
  return {
    ...config,
    name: b.name,
    slug: 'shipaton-' + id,
    version: '1.0.0',
    scheme: 'shipaton-' + id,
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    icon: `./assets/brands/${id}/icon.png`,
    ios: {
      supportsTablet: false,
      bundleIdentifier: (process.env.BUNDLE_ROOT || 'com.example.shipaton') + '.' + id,
      infoPlist: { ITSAppUsesNonExemptEncryption: false },
      entitlements: {
        'aps-environment': process.env.NODE_ENV === 'production' ? 'production' : 'development',
      },
    },
    android: {
      package: (process.env.BUNDLE_ROOT || 'com.example.shipaton') + '.' + id,
      adaptiveIcon: {
        foregroundImage: `./assets/brands/${id}/adaptive.png`,
        backgroundColor: b.color,
      },
      blockedPermissions: id === 'rehearsal' ? [] : ['android.permission.RECORD_AUDIO'],
    },
    web: { bundler: 'metro', output: 'single', favicon: `./assets/brands/${id}/icon.png` },
    plugins: [
      [
        'onesignal-expo-plugin',
        { mode: process.env.NODE_ENV === 'production' ? 'production' : 'development' },
      ],
      'expo-router',
      'expo-secure-store',
      [
        'expo-audio',
        {
          microphonePermission:
            id === 'rehearsal' ? 'Record a practice response when you choose voice input.' : false,
          recordAudioAndroid: id === 'rehearsal',
        },
      ],
      '@layers/expo',
      'expo-font',
      'expo-asset',
      'expo-sharing',
    ],
    extra: {
      variant: id,
      portfolioPreview: process.env.PORTFOLIO_PREVIEW === '1',
      revenueCatIosKey: value('RC_IOS_PUBLIC_KEY'),
      revenueCatAndroidKey: value('RC_ANDROID_PUBLIC_KEY'),
      oneSignalAppId: value('ONESIGNAL_APP_ID'),
      layersAppId: value('LAYERS_APP_ID'),
      supportEmail: process.env.SUPPORT_EMAIL || '',
      legalOrigin: process.env.LEGAL_ORIGIN || '',
      operatorName: process.env.OPERATOR_NAME || '',
      hostingRegion: process.env.HOSTING_REGION || '',
      backupRetentionDays: process.env.BACKUP_RETENTION_DAYS || '',
      ...(value('EAS_PROJECT_ID') || process.env.EAS_PROJECT_ID
        ? { eas: { projectId: value('EAS_PROJECT_ID') || process.env.EAS_PROJECT_ID } }
        : {}),
    },
  };
};
