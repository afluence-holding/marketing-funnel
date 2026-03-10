const TIMEZONE_MAP: Record<string, string> = {
  '1': 'America/New_York',
  '30': 'Europe/Athens',
  '31': 'Europe/Amsterdam',
  '32': 'Europe/Brussels',
  '33': 'Europe/Paris',
  '34': 'Europe/Madrid',
  '36': 'Europe/Budapest',
  '39': 'Europe/Rome',
  '41': 'Europe/Zurich',
  '43': 'Europe/Vienna',
  '44': 'Europe/London',
  '45': 'Europe/Copenhagen',
  '46': 'Europe/Stockholm',
  '47': 'Europe/Oslo',
  '48': 'Europe/Warsaw',
  '49': 'Europe/Berlin',
  '51': 'America/Lima',
  '52': 'America/Mexico_City',
  '53': 'America/Havana',
  '54': 'America/Argentina/Buenos_Aires',
  '55': 'America/Sao_Paulo',
  '56': 'America/Santiago',
  '57': 'America/Bogota',
  '58': 'America/Caracas',
  '61': 'Australia/Sydney',
  '64': 'Pacific/Auckland',
  '65': 'Asia/Singapore',
  '66': 'Asia/Bangkok',
  '81': 'Asia/Tokyo',
  '258': 'Africa/Maputo',
  '351': 'Europe/Lisbon',
  '352': 'Europe/Luxembourg',
  '353': 'Europe/Dublin',
  '358': 'Europe/Helsinki',
  '376': 'Europe/Andorra',
  '420': 'Europe/Prague',
  '502': 'America/Guatemala',
  '503': 'America/El_Salvador',
  '504': 'America/Tegucigalpa',
  '505': 'America/Managua',
  '506': 'America/Costa_Rica',
  '507': 'America/Panama',
  '591': 'America/La_Paz',
  '593': 'America/Guayaquil',
  '595': 'America/Asuncion',
  '598': 'America/Montevideo',
  '686': 'Pacific/Tarawa',
  '971': 'Asia/Dubai',
};

const COUNTRY_CODES = Object.keys(TIMEZONE_MAP).sort((a, b) => b.length - a.length);
const DEFAULT_TIMEZONE = 'America/Mexico_City';

export function normalizePhoneNumber(phoneNumber: string): string | null {
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  if (!cleaned) return null;

  let normalized = cleaned;
  if (normalized.startsWith('+')) {
    normalized = normalized.slice(1);
  } else if (normalized.startsWith('00')) {
    normalized = normalized.slice(2);
  }

  if (!/^\d{9,15}$/.test(normalized)) {
    return null;
  }

  if (normalized.startsWith('52') && normalized.charAt(2) !== '1') {
    normalized = `521${normalized.slice(2)}`;
  }

  if (normalized.startsWith('54') && normalized.charAt(2) !== '9') {
    normalized = `549${normalized.slice(2)}`;
  }

  if (normalized.startsWith('57')) {
    const digitsAfterPrefix = normalized.slice(2);
    if (digitsAfterPrefix.length === 9) {
      normalized = `573${digitsAfterPrefix}`;
    }
  }

  if (normalized.startsWith('51')) {
    const digitsAfterPrefix = normalized.slice(2);
    if (
      digitsAfterPrefix.length === 8 ||
      (digitsAfterPrefix.length === 9 && digitsAfterPrefix.charAt(0) !== '9')
    ) {
      normalized = `519${digitsAfterPrefix}`;
    }
  }

  if (normalized.startsWith('593')) {
    const digitsAfterPrefix = normalized.slice(3);
    if (digitsAfterPrefix.length < 9 || digitsAfterPrefix.charAt(0) !== '9') {
      normalized = `5939${digitsAfterPrefix}`;
    }
  }

  return /^\d{9,15}$/.test(normalized) ? normalized : null;
}

export function getTimezoneFromPhone(phone: string): string {
  for (const code of COUNTRY_CODES) {
    if (phone.startsWith(code)) {
      return TIMEZONE_MAP[code];
    }
  }

  return DEFAULT_TIMEZONE;
}

export function normalizePhoneAndGetTimezone(phoneNumber: string) {
  const phone = normalizePhoneNumber(phoneNumber);
  if (!phone) return null;

  return {
    phone,
    timezone: getTimezoneFromPhone(phone),
  };
}

export function getCurrentDateInTimezone(timezone: string): string {
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
  return today.toISOString().slice(0, 10);
}
