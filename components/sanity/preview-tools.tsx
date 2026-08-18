import {draftMode} from 'next/headers'
import {redirect} from 'next/navigation'
import {VisualEditing} from 'next-sanity/visual-editing'

async function disableDraftMode() {
  'use server'
  const draft = await draftMode()
  draft.disable()
  redirect('/')
}

export async function PreviewTools() {
  const {isEnabled} = await draftMode()
  if (!isEnabled) return null

  return (
    <>
      <aside className="preview-indicator" role="status">
        <span>Draft preview is on</span>
        <form action={disableDraftMode}><button type="submit">Exit preview</button></form>
      </aside>
      <VisualEditing />
    </>
  )
}
