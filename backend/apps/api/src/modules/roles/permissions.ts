export enum Permission {
	EventCreate = "event.create",
	EventUpdate = "event.update",
	EventDuplicate = "event.duplicate",
	EventManageApplications = "event.manageApplications",
	EventReviewSugarCubes = "event.reviewSugarCubes",

	OrganisationCreate = "organisation.create",
	OrganisationUpdate = "organisation.update",
	OrganisationAddUser = "organisation.addUser",
	OrganisationUpdateUser = "organisation.updateUser",
	OrganisationDeleteUser = "organisation.deleteUser",

	RoleCreate = "role.create",
	RoleUpdate = "role.update",
	RoleDelete = "role.delete",

	UserUpdateRole = "user.updateRole",
	UserDelete = "user.delete",
}
