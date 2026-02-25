import { User } from "../../users";
import { CreateDateColumn, type DeepPartial, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Organization } from "./organization.entity";

@Entity()
export class OrganizationMember {
	@PrimaryGeneratedColumn()
	id: string;

	@ManyToOne(
		() => Organization,
		(organization) => organization.members,
	)
	organization: Organization;

	@ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
	user: User;

	@CreateDateColumn()
	createdAt: Date;

	update(data: DeepPartial<OrganizationMember>) {
		Object.assign(this, data);
	}

	constructor(partial?: DeepPartial<OrganizationMember>) {
		Object.assign(this, partial);
	}
}
