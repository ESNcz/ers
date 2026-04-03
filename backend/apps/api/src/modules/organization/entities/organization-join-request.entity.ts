import { User } from "../../users";
import { Column, CreateDateColumn, type DeepPartial, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Organization } from "./organization.entity";

export enum JoinRequestStatus {
	Pending = "pending",
	Accepted = "accepted",
	Rejected = "rejected",
}

@Entity()
export class OrganizationJoinRequest {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Organization, { nullable: false, onDelete: "CASCADE" })
	organization: Organization;

	@ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
	user: User;

	@Column({ type: "enum", enum: JoinRequestStatus, default: JoinRequestStatus.Pending })
	status: JoinRequestStatus;

	@ManyToOne(() => User, { nullable: true })
	reviewedBy: User | null;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	update(data: DeepPartial<OrganizationJoinRequest>) {
		Object.assign(this, data);
	}

	constructor(partial?: DeepPartial<OrganizationJoinRequest>) {
		Object.assign(this, partial);
	}
}
