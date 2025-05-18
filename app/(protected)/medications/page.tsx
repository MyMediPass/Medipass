import { getUser } from "@/lib/auth";
import { getMedications } from "@/lib/medications";
import MedicationsClientPage from "./medications-client"; // Adjusted import path

export default async function MedicationsPage() {
  const user = await getUser();

  if (!user) {
    return (
      <div className="container px-4 md:px-6 py-6 md:py-10 text-center">
        <p>Loading user information or user not found...</p>
      </div>
    );
  }

  let medications = [];
  try {
    medications = await getMedications(user.id);
  } catch (error) {
    console.error("Failed to fetch medications:", error);
    // Optionally, render an error message to the user within the client component
    // or handle it here directly.
    return (
      <div className="container px-4 md:px-6 py-6 md:py-10 text-center">
        <p>Could not load medication data. Please try again later.</p>
      </div>
    );
  }

  return <MedicationsClientPage initialMedications={medications} user={user} />;
}
