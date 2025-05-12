import { getUser } from '@/lib/auth'
import { UserProvider } from './user-provider'

export async function AuthProvider({ children }: { children: React.ReactNode }) {
    const user = await getUser()

    return <UserProvider user={user}>{children}</UserProvider>
} 