import { bech32 } from 'bech32'

export const bech32Encode = (content) => {
    let utf8Encode = new TextEncoder()
    const words = bech32.toWords(utf8Encode.encode(content))
    return bech32.encode('lnurl', words, 250).toUpperCase()
}