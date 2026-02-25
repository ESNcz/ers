import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "../permissions";

@Entity()
export class Role {
	@PrimaryGeneratedColumn("increment")
	id: number;

	@Column()
	name: string;

	@Column({ enum: Permission, array: true, type: "enum" })
	permissions: Permission[];

	isAdmin() {
		return this.id === 1 && this.name.toLowerCase() === "admin";
	}

	hasPermission(userPermission: Permission) {
		return this.isAdmin() || this.permissions.includes(userPermission);
	}

	hasOneOfPermissions(userPermissions: Permission[]) {
		return this.isAdmin() || userPermissions.some((permission) => this.permissions.includes(permission));
	}

	constructor(role?: Partial<Role>) {
		Object.assign(this, role);
	}
}
