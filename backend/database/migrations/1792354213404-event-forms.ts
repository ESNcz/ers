import { MigrationInterface, QueryRunner } from "typeorm";

export class EventForms1792354213404 implements MigrationInterface {
  name = "EventForms1792354213404";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "event_form" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "required" boolean NOT NULL DEFAULT false, "deadline" TIMESTAMP WITH TIME ZONE NOT NULL, "position" integer NOT NULL DEFAULT '0', "fields" json NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "event_id" integer NOT NULL, CONSTRAINT "PK_cbc36b42e70b39e331d1b09d262" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "event_form_response" ("id" SERIAL NOT NULL, "answers" json NOT NULL DEFAULT '{}', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "form_id" integer NOT NULL, "application_id" integer NOT NULL, CONSTRAINT "UQ_e6b2157fe218a54a0e87d8edf36" UNIQUE ("form_id", "application_id"), CONSTRAINT "PK_ffe2251cf40829ceb16e953f3c7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_form" ADD CONSTRAINT "FK_b6ae7f1ed7ceea1acd9561d792b" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_form_response" ADD CONSTRAINT "FK_d5b6c4b9b30e2b0f91d2dfd9cac" FOREIGN KEY ("form_id") REFERENCES "event_form"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_form_response" ADD CONSTRAINT "FK_18188a49b968110a5e9f7db0492" FOREIGN KEY ("application_id") REFERENCES "event_application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event_form_response" DROP CONSTRAINT "FK_18188a49b968110a5e9f7db0492"`);
    await queryRunner.query(`ALTER TABLE "event_form_response" DROP CONSTRAINT "FK_d5b6c4b9b30e2b0f91d2dfd9cac"`);
    await queryRunner.query(`ALTER TABLE "event_form" DROP CONSTRAINT "FK_b6ae7f1ed7ceea1acd9561d792b"`);
    await queryRunner.query(`DROP TABLE "event_form_response"`);
    await queryRunner.query(`DROP TABLE "event_form"`);
  }
}
