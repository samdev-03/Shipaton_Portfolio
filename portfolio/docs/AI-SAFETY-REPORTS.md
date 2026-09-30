# AI content reports

AI practice responses and wording feedback have an in-app Report action. Sending explicitly shares only the selected output, scenario, reason and optional note with the operator. The API resolves content from the owned rehearsal and version, rejects user messages or stale targets, limits submissions and deduplicates retries. A paid subscription is not required to report saved AI content.

Reports use AES-GCM encrypted payloads in the existing database. They do not enter analytics, logs or an external AI request. Export includes the user's reports; deleting the rehearsal or account cascades to its reports. Never copy a report into a public issue, submission evidence or social post.

## Operator review

Use the existing protected operations API with the private OPS_TOKEN, on an authorized operator machine. Do not put the token in a URL, source file, screenshot or shell transcript.

- GET /ops/safety-reports returns the oldest 100 unreviewed reports. Review this queue daily when the service is in use and promptly after a complaint.
- Investigate the selected response and reason. Use fictional reproduction inputs and improve the relevant prompt, response validation or content filter when warranted. Test the change before deployment. Do not promise an immediate individual reply; reports intentionally omit the user's email from the review output.
- After reviewing and taking appropriate action, POST /ops/safety-reports/{id}/reviewed marks it reviewed. This endpoint requires the same operations token. Repeat the GET if the queue contained 100 records.
- Account deletion can remove reports before review, as disclosed. Investigations must not create undeclared permanent copies of user content.

The review queue complements the existing provider safety instructions and output validation; accepting a report does not by itself establish that a harmful-output issue has been fixed.

Official Google requirement: https://support.google.com/googleplay/android-developer/answer/13985936
