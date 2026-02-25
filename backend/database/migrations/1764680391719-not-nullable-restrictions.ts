import { MigrationInterface, QueryRunner } from "typeorm";

export class NotNullableRestrictions1764680391719 implements MigrationInterface {
    name = 'NotNullableRestrictions1764680391719'

    public async up(queryRunner: QueryRunner): Promise<void> {
			await queryRunner.query(`UPDATE "event_application" SET "allergies" = '' WHERE "allergies" IS NULL`);
			await queryRunner.query(`ALTER TABLE "event_application" ALTER COLUMN "allergies" SET DEFAULT ''`);
			await queryRunner.query(`ALTER TABLE "event_application" ALTER COLUMN "allergies" SET NOT NULL`);
			await queryRunner.query(`UPDATE "event_application" SET "food_restriction" = '' WHERE "food_restriction" IS NULL`);
			await queryRunner.query(`ALTER TABLE "event_application" ALTER COLUMN "food_restriction" SET DEFAULT ''`);
			await queryRunner.query(`ALTER TABLE "event_application" ALTER COLUMN "food_restriction" SET NOT NULL`);
			await queryRunner.query(`UPDATE "event_application" SET "health_limitations" = '' WHERE "health_limitations" IS NULL`);
			await queryRunner.query(`ALTER TABLE "event_application" ALTER COLUMN "health_limitations" SET DEFAULT ''`);
			await queryRunner.query(`ALTER TABLE "event_application" ALTER COLUMN "health_limitations" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_application" ALTER COLUMN "health_limitations" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "event_application" ALTER COLUMN "health_limitations" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "event_application" ALTER COLUMN "food_restriction" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "event_application" ALTER COLUMN "food_restriction" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "event_application" ALTER COLUMN "allergies" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "event_application" ALTER COLUMN "allergies" DROP NOT NULL`);
    }

}
