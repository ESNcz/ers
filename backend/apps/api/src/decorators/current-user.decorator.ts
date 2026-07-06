import {
  BadRequestException,
  type ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from "@nestjs/common";
import type { Request } from "express";

/**
 * Returns current user data
 * @param dataOrPipes
 * @returns User
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- NestJS defines this the same way
export const CurrentUser = (...dataOrPipes: any) =>
  createParamDecorator((_, ctx: ExecutionContext) => {
    if (ctx.getType() !== "http") throw new BadRequestException("Invalid context");

    const request = ctx.switchToHttp().getRequest<Request>();

    if (!request.user) throw new UnauthorizedException();

    return request.user;
  })(...dataOrPipes);
