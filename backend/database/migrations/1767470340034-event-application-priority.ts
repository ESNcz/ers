import { MigrationInterface, QueryRunner } from "typeorm";

export class EventApplicationPriority1767470340034 implements MigrationInterface {
    name = 'EventApplicationPriority1767470340034'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_application" ADD "priority" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_application" DROP COLUMN "priority"`);
    }

}
