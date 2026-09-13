import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AddressesModule } from "@api/modules/addresses/addresses.module";
import { PhotoModule } from "@api/modules/photo";
import { User } from "@api/modules/users/entities";
import { UsersService } from "@api/modules/users/users.service";

@Module({
  imports: [TypeOrmModule.forFeature([User]), PhotoModule, AddressesModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
