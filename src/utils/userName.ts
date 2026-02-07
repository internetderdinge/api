import { getUserById } from "../accounts/auth0.service";
import type { Patient } from "../types/patient"; // Assuming a `Patient` type exists in your project

const generateUserName = async (patient: Patient): Promise<string | null> => {
  if (patient.owner) {
    const auth0UserById = await getUserById(patient.owner);
    patient.auth0User = auth0UserById.data;
  }

  if (patient?.auth0User?.app_metadata?.first_name) {
    return `${patient.auth0User.app_metadata.first_name} ${patient.auth0User.app_metadata.last_name}`;
  }
  if (patient?.auth0User?.family_name) {
    return `${patient.auth0User.given_name} ${patient.auth0User.family_name}`;
  }

  if (patient && patient?.auth0User) {
    return patient.auth0User.name;
  }

  if (patient && (patient.meta?.firstName || patient.meta?.lastName)) {
    return `${patient.meta?.firstName}${patient.meta?.firstName ? " " : ""}${patient.meta?.lastName}`;
  }
  return null;
};

export default generateUserName;
