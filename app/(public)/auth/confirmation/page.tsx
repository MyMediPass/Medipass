import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConfirmationUI } from './confirmation-ui'

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { message?: string; error?: string; code?: string }
}) {
  const supabase = await createClient()

  // Check if we have a code in the URL
  const code = searchParams?.code

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      redirect('/dashboard')
    }
  }

  return <ConfirmationUI searchParams={searchParams} />
}
