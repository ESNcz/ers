import { MigrationInterface, QueryRunner } from "typeorm";

export class EventPriorityListDeadline1769500000000 implements MigrationInterface {
    name = 'EventPriorityListDeadline1769500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" ADD "priority_list_deadline" TIMESTAMP`);
        await queryRunner.query(`UPDATE "event" SET "priority_list_deadline" = "since" WHERE "priority_list_deadline" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "priority_list_deadline"`);
    }

}
