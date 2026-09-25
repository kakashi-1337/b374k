const bolt11 = require('bolt11')

module.exports = {
  parse: (str) => {
    let parsedBolt11
    try {
      parsedBolt11 = bolt11.decode(str?.replace(/lightning:|LIGHTNING:/g, ''))
    } catch {
      return null
    }
    return parsedBolt11
  },
  create: () => null
}
