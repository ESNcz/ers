import { MigrationInterface, QueryRunner } from "typeorm";

export class SugarCubeCascadeDelete1789583000000 implements MigrationInterface {
  name = "SugarCubeCascadeDelete1789583000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sugar_cube" DROP CONSTRAINT "FK_78fcb337968dfc1fc4db97abde1"`);
    await queryRunner.query(`ALTER TABLE "sugar_cube" DROP CONSTRAINT "FK_abf6c525d7938d927c5c4935943"`);
    await queryRunner.query(`ALTER TABLE "sugar_cube" DROP CONSTRAINT "FK_af9dd1dc25ce0676aaa31433da7"`);
    await queryRunner.query(
      `ALTER TABLE "sugar_cube" ADD CONSTRAINT "FK_78fcb337968dfc1fc4db97abde1" FOREIGN KEY ("from_user_id") REFERENCES "event_application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sugar_cube" ADD CONSTRAINT "FK_abf6c525d7938d927c5c4935943" FOREIGN KEY ("to_user_id") REFERENCES "event_application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sugar_cube" ADD CONSTRAINT "FK_af9dd1dc25ce0676aaa31433da7" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sugar_cube" DROP CONSTRAINT "FK_af9dd1dc25ce0676aaa31433da7"`);
    await queryRunner.query(`ALTER TABLE "sugar_cube" DROP CONSTRAINT "FK_abf6c525d7938d927c5c4935943"`);
    await queryRunner.query(`ALTER TABLE "sugar_cube" DROP CONSTRAINT "FK_78fcb337968dfc1fc4db97abde1"`);
    await queryRunner.query(
      `ALTER TABLE "sugar_cube" ADD CONSTRAINT "FK_78fcb337968dfc1fc4db97abde1" FOREIGN KEY ("from_user_id") REFERENCES "event_application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sugar_cube" ADD CONSTRAINT "FK_abf6c525d7938d927c5c4935943" FOREIGN KEY ("to_user_id") REFERENCES "event_application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sugar_cube" ADD CONSTRAINT "FK_af9dd1dc25ce0676aaa31433da7" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
