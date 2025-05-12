
import { createClient } from "@/lib/supabase/server"

export default async function SS() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.getUser()

    console.log(data)
    if (error) {
        console.log(error)
    }

    return <div>SS</div>
}