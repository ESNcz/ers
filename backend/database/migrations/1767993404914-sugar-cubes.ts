import { MigrationInterface, QueryRunner } from "typeorm";

export class SugarCubes1767993404914 implements MigrationInterface {
    name = 'SugarCubes1767993404914'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sugar_cube" ("id" SERIAL NOT NULL, "message" character varying NOT NULL, "is_anonymous" boolean NOT NULL DEFAULT false, "is_reported" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "from_user_id" integer NOT NULL, "to_user_id" integer NOT NULL, "event_id" integer NOT NULL, CONSTRAINT "PK_d379fc30408722de7626f22360c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."role_permissions_enum" RENAME TO "role_permissions_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."role_permissions_enum" AS ENUM('event.create', 'event.update', 'event.duplicate', 'event.manageApplications', 'event.reviewSugarCubes', 'organisation.create', 'organisation.update', 'organisation.addUser', 'organisation.updateUser', 'organisation.deleteUser', 'role.create', 'role.update', 'role.delete', 'user.updateRole', 'user.delete')`);
        await queryRunner.query(`ALTER TABLE "role" ALTER COLUMN "permissions" TYPE "public"."role_permissions_enum"[] USING "permissions"::"text"::"public"."role_permissions_enum"[]`);
        await queryRunner.query(`DROP TYPE "public"."role_permissions_enum_old"`);
        await queryRunner.query(`ALTER TABLE "sugar_cube" ADD CONSTRAINT "FK_78fcb337968dfc1fc4db97abde1" FOREIGN KEY ("from_user_id") REFERENCES "event_application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sugar_cube" ADD CONSTRAINT "FK_abf6c525d7938d927c5c4935943" FOREIGN KEY ("to_user_id") REFERENCES "event_application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sugar_cube" ADD CONSTRAINT "FK_af9dd1dc25ce0676aaa31433da7" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sugar_cube" DROP CONSTRAINT "FK_af9dd1dc25ce0676aaa31433da7"`);
        await queryRunner.query(`ALTER TABLE "sugar_cube" DROP CONSTRAINT "FK_abf6c525d7938d927c5c4935943"`);
        await queryRunner.query(`ALTER TABLE "sugar_cube" DROP CONSTRAINT "FK_78fcb337968dfc1fc4db97abde1"`);
        await queryRunner.query(`CREATE TYPE "public"."role_permissions_enum_old" AS ENUM('event.create', 'event.update', 'event.duplicate', 'event.manageApplications', 'organisation.create', 'organisation.update', 'organisation.addUser', 'organisation.updateUser', 'organisation.deleteUser', 'role.create', 'role.update', 'role.delete', 'user.updateRole', 'user.delete')`);
        await queryRunner.query(`ALTER TABLE "role" ALTER COLUMN "permissions" TYPE "public"."role_permissions_enum_old"[] USING "permissions"::"text"::"public"."role_permissions_enum_old"[]`);
        await queryRunner.query(`DROP TYPE "public"."role_permissions_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."role_permissions_enum_old" RENAME TO "role_permissions_enum"`);
        await queryRunner.query(`DROP TABLE "sugar_cube"`);
    }

}
