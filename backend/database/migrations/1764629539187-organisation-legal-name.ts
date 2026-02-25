import { MigrationInterface, QueryRunner } from "typeorm";

export class OrganisationLegalName1764629539187 implements MigrationInterface {
    name = 'OrganisationLegalName1764629539187'

    public async up(queryRunner: QueryRunner): Promise<void> {
				// 1) Add column as NULLable
        await queryRunner.query(`ALTER TABLE "organization" ADD "legal_name" character varying`);
				// 2) Copy existing "name" into "legal_name"
				await queryRunner.query(`UPDATE "organization" SET "legal_name" = "name" WHERE "legal_name" IS NULL`);
				// 3) Now make it NOT NULL
				await queryRunner.query(`ALTER TABLE "organization" ALTER COLUMN "legal_name" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "legal_name"`);
    }
}
