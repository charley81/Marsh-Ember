import type {JsonLdValue} from '@/lib/structured-data'
import {serializeJsonLd} from '@/lib/structured-data'

export function JsonLd({data}: {data: JsonLdValue}) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: serializeJsonLd(data)}} />
}
