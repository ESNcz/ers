import { MigrationInterface, QueryRunner } from "typeorm";

export class PushSubscriptions1793704984990 implements MigrationInterface {
  name = "PushSubscriptions1793704984990";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "push_subscription" ("id" SERIAL NOT NULL, "endpoint" character varying NOT NULL, "p256dh" character varying NOT NULL, "auth" character varying NOT NULL, "user_agent" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "PK_07fc861c0d2c38c1b830fb9cb5d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_27ae9074fc39a09bc1aee263df" ON "push_subscription" ("endpoint") `,
    );
    await queryRunner.query(
      `ALTER TABLE "push_subscription" ADD CONSTRAINT "FK_ae9b58d71ea5fff546507fae207" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "push_subscription" DROP CONSTRAINT "FK_ae9b58d71ea5fff546507fae207"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_27ae9074fc39a09bc1aee263df"`);
    await queryRunner.query(`DROP TABLE "push_subscription"`);
  }
}
