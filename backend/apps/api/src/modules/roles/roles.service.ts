import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "./entities";
import { Repository } from "typeorm";

@Injectable()
export class RolesService {
	constructor(
		@InjectRepository(Role)
		private readonly roleRepository: Repository<Role>,
	) {}

	save(role: Partial<Role>) {
		return this.roleRepository.save(role);
	}

	/**
	 * Find all roles
	 * @returns
	 */
	findAll() {
		return this.roleRepository.find({});
	}

	/**
	 * Find role by ID
	 * @param id Role ID
	 * @returns {Role} role or null
	 */
	findById(id: number) {
		return this.roleRepository.findOneBy({ id });
	}
}
