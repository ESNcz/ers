import { Body, Controller, Get, MethodNotAllowedException, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { SugarCubesService } from "@api/modules/sugar-cubes/sugar-cubes.service";
import { CookieGuard } from "../auth/providers/guards";
import { CurrentUser } from "@api/decorators";
import { User } from "@api/modules/users/entities";
import { CreateSugarCubeDto } from "@api/models/requests";
import { Permission } from "@api/modules/roles";
import { SugarCube } from "./entities/sugar-cube.entity";
import { SugarCubeRecipientOptionDto } from "@api/models/responses/sugar-cube-recipient-option.dto";

@ApiTags("Sugar Cubes")
@Controller("sugar-cubes")
@UseGuards(CookieGuard)
@ApiBearerAuth()
export class SugarCubesController {
	constructor(private readonly sugarCubesService: SugarCubesService) {}

  @ApiCreatedResponse({ type: SugarCube, description: "Sugar cube created" })
  @Post("event/:eventId")
	async createSugarCube(
		@Param("eventId", ParseIntPipe) eventId: number,
		@CurrentUser() user: User,
		@Body() dto: CreateSugarCubeDto,
	) {
		return await this.sugarCubesService.createSugarCube(eventId, user, dto);
	}

	@ApiOkResponse({ type: SugarCube, isArray: true })
	@Get("event/:eventId/received")
	async getReceivedSugarCubes(@Param("eventId", ParseIntPipe) eventId: number, @CurrentUser() currentUser: User) {
		const cubes = await this.sugarCubesService.getReceivedSugarCubes(eventId, currentUser);
		return cubes.map((cube) => {
			if (cube.isAnonymous) {
				const { fromUser, ...rest } = cube;
				return rest;
			}
			return cube;
		});
	}

	@ApiOkResponse({ type: SugarCube, isArray: true })
	@Get("event/:eventId/sent")
	async getSentSugarCubes(@CurrentUser() user: User, @Param("eventId", ParseIntPipe) eventId: number) {
		return await this.sugarCubesService.getSentSugarCubesByEventId(eventId, user);
	}

	@ApiOkResponse({ type: SugarCube })
	@Post(":id/report")
	async reportSugarCube(@CurrentUser() currentUser: User, @Param("id", ParseIntPipe) id: number) {
    const sugarCube = await this.sugarCubesService.findSugarCubeById(id)
    if(sugarCube.toUser.user.id !== currentUser.id){
      throw new MethodNotAllowedException("You are allowed to report only your own sugar cubes.");
    }
		return await this.sugarCubesService.reportSugarCube(id);
	}

	@ApiOkResponse({ type: SugarCube, isArray: true })
	@Get("event/:eventId/reported")
	async getReportedSugarCubes(@CurrentUser() currentUser: User, @Param("eventId", ParseIntPipe) eventId: number) {
    if(!currentUser.role.hasPermission(Permission.EventReviewSugarCubes)){
      throw new MethodNotAllowedException("You are allowed to review reported sugar cubes.");
    }
		return await this.sugarCubesService.getReportedSugarCubes(eventId);
	}

	@ApiOkResponse({ type: SugarCubeRecipientOptionDto })
	@Get("event/:eventId/recipient-options")
	async getSugarCubesRecipientOptions(@Param("eventId", ParseIntPipe) eventId: number, @CurrentUser() user: User) {
		return await this.sugarCubesService.getRecipientOptions(eventId, user);
	}
}
