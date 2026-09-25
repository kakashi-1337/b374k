// There is a copy of this file in pouch-native/helpers/signup-validators.js
// Be sure to make updates in both places!

import isEmail from 'validator/lib/isEmail'
import isStrongPassword from 'validator/lib/isStrongPassword'
import { isMobilePhone } from './phoneHelpers';

export const reservedUsernames = [
  'contact',
  'signin',
  'signup',
  'app',
  'home',
  'dashboard',
  'pay',
  'bridge',
  'print-qr',
  'forgot-password',
  'batch-payment',
  'manage-agents',
  'transactions',
  'activity',
  'advanced',
  'verify',
  'page',
  'referral',
  'p',
  'ln',
  'lightning',
  'bitcoin',
  'btc',
  'php',
  'cad',
  'usd',
  'download',
  'bootcamp',
  'portal',
  'careers',
  'privacy',
  'license',
  'blog',
  // potential usernames
  'zebedee',
  'zbd',
  'thndr'
]

const blockMatchSubstrings = ['pouch', 'gcash', 'maya']

const isValid = {
  companyName: (str) => str.length <= 50,
  name: (str) => str.length <= 50 && str.split(' ').length > 1,
  firstName: str => str.length > 0 && str.length <= 50,
  middleName: str => str.length > 0 && str.length <= 50,
  lastName: str => str.length > 0 && str.length <= 50,
  phone: (str, countryCode) => isMobilePhone(str, countryCode),
  email: (str) => isEmail(str),
  username: (str) => {
    return str.length >= 3 &&
      str.length <= 24 &&
      !reservedUsernames.includes(str) &&
      !blockMatchSubstrings.some((s) => str.includes(s)) &&
      /^[a-z0-9-.]+$/i.test(str)
  },
  password: (str) => {
    const options = {
      minLength: 6,
      returnScore: true,
      pointsPerUnique: 2,
      pointsPerRepeat: 1,
      pointsForContainingLower: 6,
      pointsForContainingUpper: 6,
      pointsForContainingNumber: 6,
      pointsForContainingSymbol: 6
    }
    // if you have only one type of char, you'd need 11 unique characters to pass.
    // if you only have two types of chars, you'd need 8 unique characters to pass.
    // if you have three or four types of chars, you'd need 6 characters to pass.
    const score = isStrongPassword(str, options)
    const minScoreRequired = 28
    return score >= minScoreRequired
  },
  confirmPassword: (str1, str2) => str1 === str2,
  promoCode: (str1, obj) => str1 in obj || str1 === ''
}

export default isValid
