import { OmitType, PickType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsObject } from "class-validator";
import { Event } from "../../modules/events";
import { EventLink } from "../../modules/events/entities";

class EventDetailLink extends OmitType(EventLink, ["event"]) {}

export class EventDetail extends PickType(Event, [
	"id",
	"capacity",
	"codeOfConductLink",
	"photoPolicyLink",
	"termsAndConditionsLink",
	"createdAt",
	"longDescription",
	"shortDescription",
	"registrationDeadline",
	"registrationForm",
	"since",
	"until",
	"title",
	"visible",
	"createdByUser",
	"photo",
]) {
	@IsObject({ each: true })
	@Type(() => EventDetailLink)
	links: EventDetailLink[];
	applications: number;
}
