import { MigrationInterface, QueryRunner } from "typeorm";

export class Settings1763666508713 implements MigrationInterface {
	name = "Settings1763666508713";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE TABLE "settings"
                             (
                                 "id"                   uuid      NOT NULL DEFAULT uuid_generate_v4(),
                                 "terms_and_conditions" text,
                                 "privacy_policy"       text,
                                 "footer_description"   text,
                                 "created_at"           TIMESTAMP NOT NULL DEFAULT now(),
                                 "updated_at"           TIMESTAMP NOT NULL DEFAULT now(),
                                 CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id")
                             )`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "settings"`);
	}

}
