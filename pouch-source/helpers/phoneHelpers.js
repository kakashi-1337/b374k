import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export const isMobilePhone = (str, countryCode) => {
  try {
    const number = phoneUtil.parseAndKeepRawInput(str, countryCode);
    const isValid = phoneUtil.isValidNumberForRegion(number, countryCode);
    return isValid;
  } catch (err) {
    return false;
  }
};

// Example: +12024561414 or +639123456789
export const formatPhoneE164 = (str, countryCode) => {
  try {
    const number = phoneUtil.parseAndKeepRawInput(str, countryCode);
    return phoneUtil.format(number, PhoneNumberFormat.E164);
  } catch (err) {
    return undefined;
  }
};
