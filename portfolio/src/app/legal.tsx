import React from 'react';
import { Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen, Stack, T, Card, Button, Notice } from '../components/ui';
import { brand, config } from '../lib/config';
export default function Legal() {
  const { document } = useLocalSearchParams<{ document: string }>(),
    terms = document === 'terms',
    support = document === 'support';
  return (
    <Screen back title={terms ? 'Terms of use' : support ? 'Support' : 'Privacy policy'}>
      <Stack>
        <T kind="hero">
          {terms ? 'Clear expectations.' : support ? 'A little help.' : 'Your privacy matters.'}
        </T>
        <T kind="caption">Effective September 24, 2026 · {brand.name}</T>
        {config.operatorName ? (
          <T>Operated by {config.operatorName}.</T>
        ) : (
          <Notice message="This is a pre-release service. Operator details must be completed before public launch." />
        )}
        {terms ? (
          <>
            <T>
              {brand.name} offers everyday practice and organization tools for adults. Use it
              respectfully, with information you have permission to enter or share. You retain
              ownership of your content and grant permission to process it to provide the features
              you request.
            </T>
            <T>
              Practice cues are informal suggestions, not an assessment of your ability or a
              guarantee of workplace outcomes. Meal ideas are not medical advice and cannot
              guarantee allergy safety. Care tasks are not emergency or clinical services. Quote
              approval records a customer’s acceptance; it does not collect service payments,
              determine taxes, or replace a contract reviewed for your business.
            </T>
            <T>
              Optional subscriptions renew under the period and localized price shown at checkout.
              The store confirms eligibility for any introductory offer. Manage cancellation and
              refund requests through the provider used for purchase. Deleting an account does not
              automatically cancel a subscription. Access may continue until the paid period ends
              under your provider’s terms.
            </T>
            <T>
              Do not use the service for unlawful conduct, harassment, deception, security attacks,
              or disclosure of someone else’s confidential information. The operator may restrict
              abusive accounts and will provide a contact route for review. Features can change;
              material changes will be communicated through the app or published terms. Rights you
              have under applicable consumer law are not excluded.
            </T>
            <T>
              You may export and delete your data in Settings. Before closing an account, save
              anything you need, and tell your circle if you own one: deleting an owner’s account
              deletes their circles for all members.
            </T>
          </>
        ) : support ? (
          <>
            <T>
              For access, billing or privacy requests, contact the operator below. Include the app
              name and a short description. Never send a password, recovery code, card number,
              medical details or confidential workplace documents.
            </T>
            <T>
              Account deletion is available in Settings. If you cannot sign in, contact support from
              your account email. Support must verify control of the account before deletion; an
              email address alone is not proof. Your recovery code is the supported password reset
              method.
            </T>
            <Button title="Account and data controls" onPress={() => router.push('/settings')} />
            <T>
              Native subscriptions are managed in your store’s subscription settings. Web
              subscriptions use the billing link in the purchase receipt. Deleting this app or
              account does not cancel billing.
            </T>
          </>
        ) : (
          <>
            <T>
              We store your name and email, hashed password and recovery code, and the content you
              save. Content fields are encrypted in the service database; the server decrypts them
              to provide your features. This is not end-to-end encryption. Sessions use secure
              device storage on native apps and HttpOnly cookies on the web.
            </T>
            <T>
              Care-circle members can read shared tasks and display names. Anyone holding a quote
              approval link can read and accept that quote until the link is revoked or expires.
              Share these links and invitation codes only with intended recipients.
            </T>
            <T>
              RevenueCat and your store or Stripe process purchases and subscription identifiers.
              OneSignal processes device subscriptions and the opaque account identifier when you
              enable reminders. Layers and first-party analytics receive optional usage events after
              consent. Conversation, meal, quote and task text is excluded from those events.
              Advertising consent is disabled.
            </T>
            <T>
              If you enable AI processing and choose AI practice or transcription, selected text and
              audio are sent to OpenAI. Text requests set storage to false. Recordings are temporary
              and removed after transcription or cancellation; provider processing is also governed
              by provider policies. You can use guided practice without AI processing.
            </T>
            <T>
              Account data remains until you delete it or the account. First-party usage events
              expire after 90 days. Deletion removes active account records and queues RevenueCat
              and OneSignal deletion requests. Historical Layers data requires a tracked manual
              provider request. Operational logs contain request IDs and error classes, not request
              bodies. Security rate limits retain hashed request keys temporarily. Hosting providers
              may have separate network logs.
            </T>
            <T>
              {config.hostingRegion && config.backupRetentionDays
                ? `Our service database is hosted in ${config.hostingRegion}. Backups expire within ${config.backupRetentionDays} days under our retention schedule. `
                : 'Hosting and backup retention details have not yet been finalized for this preview. '}
              Connected providers may process data in other countries. Legally retained billing
              records follow the purchase provider’s retention obligations. Contact us for details
              about international processing and applicable transfer safeguards. We do not sell
              personal content or enable advertising tracking.
            </T>
            <T>
              Optional processing can be turned off in Settings. You can export content, delete
              saved records, or delete the account. Contact the operator to request access,
              correction, or help exercising privacy rights under applicable law. Shared care
              records also belong to the circle; another member may retain material they have
              already seen or copied.
            </T>
            <T>
              This service is intended for adults. Do not enter children’s personal data, medical
              records, payment-card details, or confidential employment material. Contact support if
              such information was submitted in error.
            </T>
          </>
        )}
        <Card>
          <Stack>
            <T kind="title">Contact the operator</T>
            {config.supportEmail ? (
              <Button
                quiet
                title={config.supportEmail}
                onPress={() => void Linking.openURL('mailto:' + config.supportEmail)}
              />
            ) : (
              <T>Support contact will be available when this service opens to the public.</T>
            )}
          </Stack>
        </Card>
      </Stack>
    </Screen>
  );
}
