/* =====================================================================
   PRIME KREATIVES — Automation Builder email backend (Google Apps Script)
   ---------------------------------------------------------------------
   WHAT IT DOES
   Receives the full automation submission from the builder app and emails
   it to prime.kreatives@gmail.com (formatted email + project JSON attached).

   SETUP (5 minutes, free)
   1. Go to https://script.google.com → New project.
   2. Delete the default myFunction block, paste this entire file, Save.
   3. Deploy → New deployment → type: Web app.
      - Execute as: Me
      - Who has access: Anyone
   4. Copy the Web app URL (ends in /exec).
   5. In the builder app: Projects → Connection settings → paste URL → Save.
   6. Click "Submit to Prime Kreatives" — one click, full content emailed.

   No passwords or API keys needed. Gmail sends as YOU (the script owner).
   ===================================================================== */

const RECIPIENT = 'prime.kreatives@gmail.com';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const subject = data.subject || 'New AI Automation Project';
    const body = data.body || '(no content received)';
    const p = data.project || {};
    const client = p.client || {};

    const html =
      '<h2 style="font-family:sans-serif;color:#0F294C">Prime Kreatives — New Project Submission</h2>' +
      '<pre style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">' +
      escapeHtml(body) + '</pre>' +
      '<hr><p style="font-family:sans-serif;color:#666;font-size:12px">' +
      'Sent from the AI Automation &amp; System Improvement Builder. ' +
      'Full project JSON attached.</p>';

    const attachments = [];
    if (data.project) {
      attachments.push(Utilities.newBlob(
        JSON.stringify(p, null, 2),
        'application/json',
        (p.id || 'automation-project') + '.json'
      ));
    }

    GmailApp.sendEmail(RECIPIENT, subject, body, {
      htmlBody: html,
      attachments: attachments,
      replyTo: client.email || undefined,
      name: 'Prime Kreatives Builder'
    });

    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

// Health check: open the /exec URL in a browser, expect {"ok":true,...}.
function doGet() {
  return jsonOut({ ok: true, service: 'prime-kreatives-builder-mailer' });
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
