import {createImageUrlBuilder} from '@sanity/image-url'
import type {SanityImageSource} from '@sanity/image-url'
import {getSanityPublicEnv} from './env'

const builder = createImageUrlBuilder(getSanityPublicEnv())

export function imageUrl(source: SanityImageSource, width = 1600, height = 1000) {
  return builder.image(source).width(width).height(height).fit('crop').auto('format').quality(85).url()
}
