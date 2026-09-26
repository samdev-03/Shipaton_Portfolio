import { Platform } from 'react-native';
export async function exportJson(value: any) {
  const text = JSON.stringify(value, null, 2);
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-data.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } else {
    const { File, Paths } = await import('expo-file-system'),
      Sharing = await import('expo-sharing');
    const f = new File(Paths.cache, 'my-data.json');
    try {
      f.write(text);
      await Sharing.shareAsync(f.uri, { mimeType: 'application/json', UTI: 'public.json' });
    } finally {
      if (f.exists) f.delete();
    }
  }
}
