import { getUser } from "@/lib/auth";
// import { getMedications } from "@/lib/medications"; // No longer needed
import MedicationsClientPage from "./medications-client";
import type { User } from "@clerk/nextjs/server"; // Keep this to type the full user object from Clerk

// Define the structure of the plain user object we will pass to the client
export interface PlainUser {
  id: string;
  fullName: string | null;
  firstName: string | null;
  // We only need the primary email address for the client component logic
  primaryEmailAddress: string | null;
}

export default async function MedicationsPage() {
  const clerkUser: User | null = await getUser();

  if (!clerkUser) {
    return (
      <div className="container px-4 md:px-6 py-6 md:py-10 text-center">
        <p>Loading user information or user not found...</p>
      </div>
    );
  }

  // Create a plain user object to pass to the client component
  const plainUser: PlainUser = {
    id: clerkUser.id,
    fullName: clerkUser.fullName,
    firstName: clerkUser.firstName,
    primaryEmailAddress: clerkUser.emailAddresses.find(email => email.id === clerkUser.primaryEmailAddressId)?.emailAddress || null,
  };

  // Medications will be fetched on the client-side by MedicationsClientPage using InstantDB
  // let medications = [];
  // try {
  //   medications = await getMedications(user.id);
  // } catch (error) {
  //   console.error("Failed to fetch medications:", error);
  //   return (
  //     <div className="container px-4 md:px-6 py-6 md:py-10 text-center">
  //       <p>Could not load medication data. Please try again later.</p>
  //     </div>
  //   );
  // }

  return <MedicationsClientPage user={plainUser} />;
}
