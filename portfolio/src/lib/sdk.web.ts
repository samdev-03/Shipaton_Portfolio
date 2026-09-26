export async function initializeSdk(_id: string) {}
export async function updateConsent(_analytics: boolean, _push: boolean, _id: string) {}
export async function disconnectSdk() {}
export async function packages(): Promise<any[]> {
  return [];
}
export async function buy(_item: any) {
  throw Error('Use web checkout to subscribe.');
}
export async function restore() {
  throw Error('Refresh access using the account used for checkout.');
}
export async function manageSubscription() {
  throw Error('Use the billing link in your purchase receipt.');
}
export async function enablePush(): Promise<boolean> {
  throw Error('Use the mobile app to enable reminders.');
}
export function trackSdk(_name: string) {}
