
import { useMantineColorScheme, Image } from '@mantine/core'
import pouchLogo from 'assets/images/logo.svg'
import pouchLogoWhite from 'assets/images/logo-white.svg'

const BrandLogo = (props) => {
  const { colorScheme } = useMantineColorScheme()
  return (
    <a href='https://pouch.ph'>
      <Image src={colorScheme === 'light' ? pouchLogo : pouchLogoWhite} {...props} />
    </a>
  )
}

export default BrandLogo
