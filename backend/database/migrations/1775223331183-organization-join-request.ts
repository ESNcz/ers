import { MigrationInterface, QueryRunner } from "typeorm";

export class OrganizationJoinRequest1775223331183 implements MigrationInterface {
    name = 'OrganizationJoinRequest1775223331183'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."organization_join_request_status_enum" AS ENUM('pending', 'accepted', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "organization_join_request" ("id" SERIAL NOT NULL, "status" "public"."organization_join_request_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "organization_id" uuid NOT NULL, "user_id" uuid NOT NULL, "reviewed_by_id" uuid, CONSTRAINT "PK_db4fcd1b7bda6e77eef6dd97ab4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."role_permissions_enum" RENAME TO "role_permissions_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."role_permissions_enum" AS ENUM('event.create', 'event.update', 'event.duplicate', 'event.manageApplications', 'event.reviewSugarCubes', 'organisation.create', 'organisation.update', 'organisation.addUser', 'organisation.updateUser', 'organisation.deleteUser', 'organisation.manageJoinRequests', 'role.create', 'role.update', 'role.delete', 'user.update', 'user.updateRole', 'user.delete')`);
        await queryRunner.query(`ALTER TABLE "role" ALTER COLUMN "permissions" TYPE "public"."role_permissions_enum"[] USING "permissions"::"text"::"public"."role_permissions_enum"[]`);
        await queryRunner.query(`DROP TYPE "public"."role_permissions_enum_old"`);
        await queryRunner.query(`ALTER TABLE "organization_join_request" ADD CONSTRAINT "FK_0d34511508e774edebdfce5d6fd" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_join_request" ADD CONSTRAINT "FK_30fec0e8ddb6a13789ebf6f0ecc" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_join_request" ADD CONSTRAINT "FK_a1320e83e7821532070f7e890a8" FOREIGN KEY ("reviewed_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_join_request" DROP CONSTRAINT "FK_a1320e83e7821532070f7e890a8"`);
        await queryRunner.query(`ALTER TABLE "organization_join_request" DROP CONSTRAINT "FK_30fec0e8ddb6a13789ebf6f0ecc"`);
        await queryRunner.query(`ALTER TABLE "organization_join_request" DROP CONSTRAINT "FK_0d34511508e774edebdfce5d6fd"`);
        await queryRunner.query(`CREATE TYPE "public"."role_permissions_enum_old" AS ENUM('event.create', 'event.update', 'event.duplicate', 'event.manageApplications', 'event.reviewSugarCubes', 'organisation.create', 'organisation.update', 'organisation.addUser', 'organisation.updateUser', 'organisation.deleteUser', 'role.create', 'role.update', 'role.delete', 'user.update', 'user.updateRole', 'user.delete')`);
        await queryRunner.query(`ALTER TABLE "role" ALTER COLUMN "permissions" TYPE "public"."role_permissions_enum_old"[] USING "permissions"::"text"::"public"."role_permissions_enum_old"[]`);
        await queryRunner.query(`DROP TYPE "public"."role_permissions_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."role_permissions_enum_old" RENAME TO "role_permissions_enum"`);
        await queryRunner.query(`DROP TABLE "organization_join_request"`);
        await queryRunner.query(`DROP TYPE "public"."organization_join_request_status_enum"`);
    }

}
