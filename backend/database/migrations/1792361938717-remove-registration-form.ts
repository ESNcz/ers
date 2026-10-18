import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveRegistrationForm1792361938717 implements MigrationInterface {
  name = "RemoveRegistrationForm1792361938717";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "registration_form"`);
    await queryRunner.query(`ALTER TABLE "event_application" DROP COLUMN "additional_data"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event_application" ADD "additional_data" json NOT NULL DEFAULT '{}'`);
    await queryRunner.query(`ALTER TABLE "event" ADD "registration_form" json`);
  }
}
