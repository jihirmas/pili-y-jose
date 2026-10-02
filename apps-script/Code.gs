/* Pili & Jose — deploy as an anonymous Web App, executing as its owner.
 * Keep these event constants aligned with src/config/event.ts. */
var RSVP_DEADLINE = '2026-12-10T00:00:00-03:00';
var TIMEZONE = 'America/Santiago';
var HEADERS = [
  'submitted_at',
  'rsvp_id',
  'invitation_type',
  'event_scope',
  'invited_with_companion',
  'companion_attending',
  'guest_count',
  'guest_name',
  'email',
  'phone',
  'guest_diet_type',
  'guest_diet_detail',
  'companion_name',
  'companion_diet_type',
  'companion_diet_detail',
  'song',
];
var INVITATIONS = [
  'ceremony_single',
  'ceremony_couple',
  'party_single',
  'party_couple',
];
var DIETS = ['none', 'vegetarian', 'vegan', 'celiac', 'allergy', 'other'];

function fail_(code) {
  throw new Error(code);
}
function closed_() {
  return Date.now() >= Date.parse(RSVP_DEADLINE);
}
function normalizePhone_(value) {
  var digits = String(value).replace(/^'/, '').replace(/\D/g, '');
  if (digits.indexOf('00') === 0) digits = digits.slice(2);
  return /^9\d{8}$/.test(digits) ? '56' + digits : digits;
}
function safeCell_(value) {
  if (typeof value !== 'string') return value;
  // Trim controls and whitespace before checking formula-leading characters.
  var text = value.replace(/^[\s\u0000-\u001f\u007f]+/, '').trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}
function text_(value, max, required) {
  if (value === undefined || value === null) value = '';
  if (typeof value !== 'string') fail_('VALIDATION_ERROR');
  value = value.trim();
  if (
    (required && !value) ||
    value.length > max ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)
  )
    fail_('VALIDATION_ERROR');
  return value;
}
function name_(value) {
  value = text_(value, 120, true);
  if (value.length < 3 || value.split(/\s+/).length < 2)
    fail_('VALIDATION_ERROR');
  return value;
}
function diet_(type, detail) {
  if (DIETS.indexOf(type) === -1) fail_('VALIDATION_ERROR');
  return {
    type: type,
    detail:
      type === 'allergy' || type === 'other' ? text_(detail, 500, true) : '',
  };
}
function origin_(properties) {
  var value = properties.PARENT_ORIGIN || '';
  if (
    !/^https:\/\/[a-zA-Z0-9.-]+(?::\d+)?$/.test(value) &&
    !/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(value)
  )
    fail_('SERVER_ERROR');
  return value;
}
function invitation_(token, properties) {
  if (typeof token !== 'string' || !token) fail_('INVALID_INVITE');
  var matches = INVITATIONS.filter(function (type) {
    return properties['TOKEN_' + type.toUpperCase()] === token;
  });
  if (matches.length !== 1) fail_('INVALID_INVITE');
  return matches[0];
}
function validate_(data, type) {
  var ceremony = type.indexOf('ceremony_') === 0;
  var couple = type.indexOf('_couple') > 0;
  var name = name_(data.guestName);
  var email = text_(data.email, 254, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail_('VALIDATION_ERROR');
  var phone = text_(data.phone, 40, true);
  if (
    !/^[+\d\s().-]+$/.test(phone) ||
    !/^\d{7,15}$/.test(normalizePhone_(phone))
  )
    fail_('VALIDATION_ERROR');
  if (couple && typeof data.companionAttending !== 'boolean')
    fail_('VALIDATION_ERROR');
  var companion = couple && data.companionAttending === true;
  var guestDiet = ceremony
    ? diet_(data.guestDietType, data.guestDietDetail)
    : { type: '', detail: '' };
  var companionDiet =
    ceremony && companion
      ? diet_(data.companionDietType, data.companionDietDetail)
      : { type: '', detail: '' };
  return {
    invitationType: type,
    eventScope: ceremony ? 'CEREMONY' : 'PARTY',
    invitedWithCompanion: couple,
    companionAttending: companion,
    guestCount: companion ? 2 : 1,
    guestName: name,
    email: email,
    phone: phone,
    guestDietType: guestDiet.type,
    guestDietDetail: guestDiet.detail,
    companionName: companion ? name_(data.companionName) : '',
    companionDietType: companionDiet.type,
    companionDietDetail: companionDiet.detail,
    song: text_(data.song, 200, false),
  };
}
function captcha_(token, properties) {
  if (typeof token !== 'string' || !token || token.length > 8192)
    fail_('CAPTCHA_FAILED');
  if (!properties.RECAPTCHA_SECRET) fail_('SERVER_ERROR');
  var response = UrlFetchApp.fetch(
    'https://www.google.com/recaptcha/api/siteverify',
    {
      method: 'post',
      payload: { secret: properties.RECAPTCHA_SECRET, response: token },
      muteHttpExceptions: true,
    },
  );
  if (response.getResponseCode() !== 200) fail_('CAPTCHA_FAILED');
  var result = JSON.parse(response.getContentText());
  var hostname = origin_(properties)
    .replace(/^https?:\/\//, '')
    .split(':')[0]
    .toLowerCase();
  if (result.success !== true || result.hostname !== hostname)
    fail_('CAPTCHA_FAILED');
}
function sheet_(properties) {
  if (!properties.SPREADSHEET_ID || !properties.SHEET_NAME)
    fail_('SERVER_ERROR');
  var sheet = SpreadsheetApp.openById(properties.SPREADSHEET_ID).getSheetByName(
    properties.SHEET_NAME,
  );
  if (!sheet) fail_('SERVER_ERROR');
  assertHeaders_(sheet);
  return sheet;
}
function assertHeaders_(sheet) {
  var actual = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (actual.join('|') !== HEADERS.join('|')) fail_('SERVER_ERROR');
}
function save_(data, properties) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) fail_('SERVER_ERROR');
  try {
    if (closed_()) fail_('DEADLINE_CLOSED');
    var sheet = sheet_(properties);
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var contacts = sheet.getRange(2, 9, lastRow - 1, 2).getValues();
      var duplicate = contacts.some(function (row) {
        return (
          String(row[0]).replace(/^'/, '').trim().toLowerCase() ===
            data.email &&
          normalizePhone_(row[1]) === normalizePhone_(data.phone)
        );
      });
      if (duplicate) fail_('DUPLICATE_RSVP');
    }
    // A request queued before midnight must not write after the deadline.
    if (closed_()) fail_('DEADLINE_CLOSED');
    var row = [
      new Date(),
      Utilities.getUuid(),
      data.invitationType,
      data.eventScope,
      data.invitedWithCompanion,
      data.companionAttending,
      data.guestCount,
      data.guestName,
      data.email,
      data.phone,
      data.guestDietType,
      data.guestDietDetail,
      data.companionName,
      data.companionDietType,
      data.companionDietDetail,
      data.song,
    ];
    // Format user-input cells as text before writing; prefix dangerous values too.
    sheet.getRange(lastRow + 1, 8, 1, 9).setNumberFormat('@');
    sheet
      .getRange(lastRow + 1, 1, 1, HEADERS.length)
      .setValues([row.map(safeCell_)]);
    sheet.getRange(lastRow + 1, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}
function ack_(nonce, code, properties) {
  var parentOrigin;
  try {
    parentOrigin = origin_(properties);
  } catch (_) {
    return HtmlService.createHtmlOutput('Configuración incompleta.');
  }
  var ack = {
    source: 'pili-jose-rsvp',
    nonce: nonce,
    success: code === 'RSVP_CREATED',
    code: code,
  };
  // No guest values are interpolated. JSON is escaped even though nonce is a UUID.
  var encoded = JSON.stringify(ack)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  var target = JSON.stringify(parentOrigin).replace(/</g, '\\u003c');
  // HtmlService nests this document inside its own iframe. The application is at
  // window.top; window.parent is Google's wrapper, not our React application.
  var html =
    '<!doctype html><html><head><meta name="robots" content="noindex,nofollow"></head><body><script>window.top.postMessage(' +
    encoded +
    ',' +
    target +
    ');</script></body></html>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(
    HtmlService.XFrameOptionsMode.ALLOWALL,
  );
}
function doPost(e) {
  var properties = PropertiesService.getScriptProperties().getProperties();
  var nonce = '';
  var code = 'SERVER_ERROR';
  try {
    var raw = e && e.parameter && e.parameter.payload;
    if (typeof raw !== 'string' || raw.length > 20000)
      fail_('VALIDATION_ERROR');
    var data;
    try {
      data = JSON.parse(raw);
    } catch (_) {
      fail_('VALIDATION_ERROR');
    }
    if (!data || typeof data !== 'object' || Array.isArray(data))
      fail_('VALIDATION_ERROR');
    if (
      typeof data.nonce !== 'string' ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
        data.nonce,
      )
    )
      fail_('VALIDATION_ERROR');
    nonce = data.nonce;
    origin_(properties);
    var type = invitation_(data.inviteToken, properties);
    if (closed_()) fail_('DEADLINE_CLOSED');
    var validated = validate_(data, type);
    captcha_(data.recaptchaToken, properties);
    save_(validated, properties);
    code = 'RSVP_CREATED';
  } catch (error) {
    var expected = [
      'INVALID_INVITE',
      'VALIDATION_ERROR',
      'CAPTCHA_FAILED',
      'DUPLICATE_RSVP',
      'DEADLINE_CLOSED',
    ];
    code =
      expected.indexOf(error.message) >= 0 ? error.message : 'SERVER_ERROR';
    // Never log the request, contacts, captcha token, properties or sheet contents.
    console.error(
      'RSVP failure: ' + code + '; kind=' + (error.name || 'Error'),
    );
  }
  return ack_(nonce, code, properties);
}
function setupSheet() {
  var properties = PropertiesService.getScriptProperties().getProperties();
  if (!properties.SPREADSHEET_ID || !properties.SHEET_NAME)
    throw new Error('Configure SPREADSHEET_ID and SHEET_NAME first.');
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var spreadsheet = SpreadsheetApp.openById(properties.SPREADSHEET_ID);
    spreadsheet.setSpreadsheetTimeZone(TIMEZONE);
    var sheet =
      spreadsheet.getSheetByName(properties.SHEET_NAME) ||
      spreadsheet.insertSheet(properties.SHEET_NAME);
    if (sheet.getLastRow() === 0)
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    else assertHeaders_(sheet); // Never overwrite existing data or mismatched columns.
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}
