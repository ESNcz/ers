import { Address } from "@api/modules/addresses/entities";
import { ApiHideProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  type DeepPartial,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../users";
import { OrganizationMember } from "./organization-member.entity";

// Should be parent.id but it's not converted to parent_id, so this needs to be "hardcoded"
@Entity()
@Index("idx_single_root", ["id"], { unique: true, where: "parent_id IS NULL" })
export class Organization {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	name: string;

	@Column()
	legalName: string;

	@Column({ nullable: true, default: null })
	cin: string | null;

	@Column({ nullable: true, default: null })
	vatin: string | null;

	@ManyToOne(() => Address, { nullable: false, cascade: true, eager: true })
	address: Address;

	@Column({ default: false })
	isDeleted: boolean;

	// Relations
	@ApiHideProperty()
	@OneToMany(
		() => OrganizationMember,
		(member) => member.organization,
	)
	members: OrganizationMember[];

	@ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
	manager: User | null;

	@ApiHideProperty()
	@Index()
	@ManyToOne(
		() => Organization,
		(organization) => organization.children,
	)
	parent: Organization | null;

	@ApiHideProperty()
	@OneToMany(
		() => Organization,
		(organization) => organization.parent,
	)
	children: Organization[] | null;

	// Metadata
	@CreateDateColumn()
	createdAt: Date;

	update(data: DeepPartial<Organization>) {
		Object.assign(this, data);
	}

	constructor(partial?: DeepPartial<Organization>) {
		Object.assign(this, partial);
	}
}
