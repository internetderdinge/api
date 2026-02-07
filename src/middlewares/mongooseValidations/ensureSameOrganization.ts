/**
 * Throws if patient doesn’t exist or isn’t in the given org.
 */
export async function ensureSameOrganization(
  patientId: Types.ObjectId,
  organizationId: Types.ObjectId,
  UserModel: Model<any>,
) {
  // console.log('ensureSameOrganization', patientId, organizationId);
  const user = await UserModel.findById(patientId).select('organization');
  if (!user) throw new Error('Patient not found');
  if (!user.organization.equals(organizationId)) {
    throw new Error('Patient must belong to the same organization');
  }
}
