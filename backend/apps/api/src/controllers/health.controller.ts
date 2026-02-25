import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";

@ApiExcludeController()
@Controller("health")
export class HealthController {
	@HttpCode(HttpStatus.OK)
	@Get()
	health() {}
}
