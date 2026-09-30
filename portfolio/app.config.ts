import type { ConfigContext, ExpoConfig } from 'expo/config';
import { APP_IDS, brands, AppId } from './shared/catalog.ts';
export default ({ config }: ConfigContext): ExpoConfig => {
  const id = (
      APP_IDS.includes(process.env.APP_VARIANT as AppId) ? process.env.APP_VARIANT : 'rehearsal'
    ) as AppId,
    b = brands[id],
    p = id.toUpperCase(),
    value = (key: string) => process.env[p + '_' + key] || '',
    bundleRoot =
      process.env.BUNDLE_ROOT ||
      (id === 'rehearsal' ? 'com.horizonsystemssolutions' : 'com.example.shipaton'),
    projectId =
      value('EAS_PROJECT_ID') ||
      process.env.EAS_PROJECT_ID ||
      (id === 'rehearsal' ? '28dff74a-4109-4e3b-b008-f6786819b1d4' : ''),
    production = process.env.APP_ENV === 'production' || process.env.NODE_ENV === 'production';
  return {
    ...config,
    ...(id === 'rehearsal' ? { owner: 'samdev03' } : {}),
    name: b.name,
    slug: 'shipaton-' + id,
    version: '1.0.0',
    scheme: 'shipaton-' + id,
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    icon: `./assets/brands/${id}/icon.png`,
    ios: {
      supportsTablet: false,
      bundleIdentifier: bundleRoot + '.' + id,
      infoPlist: { ITSAppUsesNonExemptEncryption: false },
      entitlements: {
        'aps-environment': production ? 'production' : 'development',
      },
    },
    android: {
      package: bundleRoot + '.' + id,
      adaptiveIcon: {
        foregroundImage: `./assets/brands/${id}/adaptive.png`,
        backgroundColor: b.color,
      },
      blockedPermissions: [
        'com.google.android.gms.permission.AD_ID',
        ...(id === 'rehearsal' ? [] : ['android.permission.RECORD_AUDIO']),
      ],
    },
    web: { bundler: 'metro', output: 'single', favicon: `./assets/brands/${id}/icon.png` },
    plugins: [
      ['onesignal-expo-plugin', { mode: production ? 'production' : 'development' }],
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
      // Layers' config plugin adds advertising declarations by default. Analytics
      // use the consent-gated SDK directly; these apps do not use ad tracking.
      ['expo-tracking-transparency', { userTrackingPermission: false }],
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
      backupRetentionPolicy: process.env.BACKUP_RETENTION_POLICY || '',
      ...(projectId ? { eas: { projectId } } : {}),
    },
  };
};
