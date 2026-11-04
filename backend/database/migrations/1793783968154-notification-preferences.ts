import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationPreferences1793783968154 implements MigrationInterface {
  name = "NotificationPreferences1793783968154";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."notification_preference_type_enum" AS ENUM('sugarCube', 'spotAssigned', 'eventPublished', 'formDeadline', 'registrationReminder')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification_preference" ("id" SERIAL NOT NULL, "type" "public"."notification_preference_type_enum" NOT NULL, "enabled" boolean NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "UQ_98793ae4db877d281012dc55998" UNIQUE ("user_id", "type"), CONSTRAINT "PK_ba8d816b10f3dcfcd2e71ce5776" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preference" ADD CONSTRAINT "FK_ff040d2d2e35c49b00525783829" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notification_preference" DROP CONSTRAINT "FK_ff040d2d2e35c49b00525783829"`);
    await queryRunner.query(`DROP TABLE "notification_preference"`);
    await queryRunner.query(`DROP TYPE "public"."notification_preference_type_enum"`);
  }
}
