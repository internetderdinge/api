const allRoles = {
  user: [],
  admin: ['getUsers', 'manageUsers'],
  patient: [],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));

export default {
  roles,
  roleRights,
};
