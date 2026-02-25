import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAllergies1764623576552 implements MigrationInterface {
    name = 'AddAllergies1764623576552'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_application" ADD "allergies" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_application" DROP COLUMN "allergies"`);
    }

}
