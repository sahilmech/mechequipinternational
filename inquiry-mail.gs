var TO_EMAIL = 'sales@mechequipinternational.com';
var FROM_NAME = 'Mech Equip';

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var data = JSON.parse(raw);
    if (data.website) return json_({ success: true, ignored: true });

    var name = String(data.name || '').trim();
    var email = String(data.email || '').trim();
    var phone = String(data.phone || '').trim();
    if (!name || !email || !phone) {
      return json_({ success: false, message: 'Missing required fields' });
    }

    var subject = String(data.subject || 'Website Inquiry - Mech Equip International');
    GmailApp.sendEmail(TO_EMAIL, subject, plainText_(data), {
      htmlBody: buildHtml_(data, subject),
      replyTo: email,
      name: FROM_NAME
    });
    return json_({ success: true });
  } catch (err) {
    return json_({ success: false, message: String(err) });
  }
}

function doGet() {
  return ContentService.createTextOutput('Mech Equip inquiry mailer is ready.');
}

function buildHtml_(data, subject) {
  var rows = [
    ['Name', data.name],
    ['Company', data.company || '—'],
    ['Email', data.email],
    ['Phone', data.phone],
    ['Product / Requirement', data.product || '—'],
    ['Message', data.message || '—'],
    ['Source Page', data.source || '—']
  ];
  var table = rows.map(function (r) {
    return '<tr><th style="border:1px solid #dce2e8;padding:14px;text-align:left;width:36%">' +
      esc_(r[0]) + '</th><td style="border:1px solid #dce2e8;padding:14px">' +
      esc_(r[1]).replace(/\n/g, '<br>') + '</td></tr>';
  }).join('');
  return '<html><body style="background:#f1f3f5;font-family:Arial,sans-serif;padding:24px">' +
    '<div style="max-width:700px;margin:auto;background:#fff">' +
    '<div style="background:#0d2b46;color:#fff;text-align:center;padding:20px;font-size:20px;font-weight:bold">Mech Equip International</div>' +
    '<div style="padding:24px"><h2 style="font-size:19px">' + esc_(subject) + '</h2>' +
    '<table style="border-collapse:collapse;width:100%;font-size:14px">' + table + '</table>' +
    '</div></div></body></html>';
}

function plainText_(data) {
  return 'Name: ' + (data.name || '') + '\nCompany: ' + (data.company || '') +
    '\nEmail: ' + (data.email || '') + '\nPhone: ' + (data.phone || '') +
    '\nProduct: ' + (data.product || '') + '\nMessage: ' + (data.message || '') +
    '\nSource: ' + (data.source || '');
}

function esc_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
