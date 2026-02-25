import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameFoodRestriction1764623494203 implements MigrationInterface {
    name = 'RenameFoodRestriction1764623494203'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_application" RENAME COLUMN "food_restriction_allergies" TO "food_restriction"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_application" RENAME COLUMN "food_restriction" TO "food_restriction_allergies"`);
    }

}
