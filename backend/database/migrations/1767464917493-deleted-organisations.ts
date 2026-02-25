import { MigrationInterface, QueryRunner } from "typeorm";

export class DeletedOrganisations1767464917493 implements MigrationInterface {
    name = 'DeletedOrganisations1767464917493'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" ADD "is_deleted" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "is_deleted"`);
    }

}
