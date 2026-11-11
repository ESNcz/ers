import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationLog1794400000000 implements MigrationInterface {
  name = "NotificationLog1794400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."notification_preference_type_enum" ADD VALUE IF NOT EXISTS 'sugarCubeDeadline' AFTER 'sugarCube'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_log_type_enum" AS ENUM('sugarCube', 'sugarCubeDeadline', 'spotAssigned', 'eventPublished', 'formDeadline', 'registrationReminder')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification_log" ("id" SERIAL NOT NULL, "type" "public"."notification_log_type_enum" NOT NULL, "entity_id" character varying NOT NULL, "sent_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "UQ_aabe9a1ceed8d3c21a8eec6a229" UNIQUE ("user_id", "type", "entity_id"), CONSTRAINT "PK_6f761cfbbd064e0f326960877d6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_log" ADD CONSTRAINT "FK_2318594e750647311b24da4ae5f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notification_log" DROP CONSTRAINT "FK_2318594e750647311b24da4ae5f"`);
    await queryRunner.query(`DROP TABLE "notification_log"`);
    await queryRunner.query(`DROP TYPE "public"."notification_log_type_enum"`);
    // Postgres can't drop an enum value - recreate the type without it
    await queryRunner.query(`DELETE FROM "notification_preference" WHERE "type" = 'sugarCubeDeadline'`);
    await queryRunner.query(
      `ALTER TYPE "public"."notification_preference_type_enum" RENAME TO "notification_preference_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_preference_type_enum" AS ENUM('sugarCube', 'spotAssigned', 'eventPublished', 'formDeadline', 'registrationReminder')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preference" ALTER COLUMN "type" TYPE "public"."notification_preference_type_enum" USING "type"::"text"::"public"."notification_preference_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notification_preference_type_enum_old"`);
  }
}
