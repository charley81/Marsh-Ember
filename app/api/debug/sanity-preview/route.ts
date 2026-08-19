import {client} from '@/sanity/client'
import {getSanityReadToken} from '@/sanity/env'

export const dynamic = 'force-dynamic'

export async function GET() {
  let token: string

  try {
    token = getSanityReadToken()
  } catch {
    return Response.json(
      {tokenPresent: false, tokenWellFormed: false, sanityAccess: 'not-tested'},
      {headers: {'Cache-Control': 'no-store'}},
    )
  }

  const tokenWellFormed = token === token.trim() && !/^['"]|['"]$/.test(token)

  try {
    await client.withConfig({token, useCdn: false, perspective: 'raw'}).fetch(
      'count(*[_type == "sanity.previewUrlSecret" && dateTime(_updatedAt) > dateTime(now()) - 3600])',
      {},
      {cache: 'no-store'},
    )

    return Response.json(
      {tokenPresent: true, tokenWellFormed, sanityAccess: 'accepted'},
      {headers: {'Cache-Control': 'no-store'}},
    )
  } catch (error) {
    const status = error && typeof error === 'object' && 'statusCode' in error
      ? (error as {statusCode?: unknown}).statusCode
      : undefined
    const sanityAccess = status === 401 ? 'unauthorized' : status === 403 ? 'forbidden' : 'failed'

    return Response.json(
      {tokenPresent: true, tokenWellFormed, sanityAccess},
      {headers: {'Cache-Control': 'no-store'}, status: 503},
    )
  }
}
