import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Role } from "./entities";
import { RolesService } from "./providers/services";

@Module({
	imports: [TypeOrmModule.forFeature([Role])],
	providers: [RolesService],
	exports: [RolesService],
})
export class RolesModule {}
