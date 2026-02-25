import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1754644578456 implements MigrationInterface {
    name = 'Init1754644578456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."role_permissions_enum" AS ENUM('event.create', 'event.update', 'event.duplicate', 'event.manageApplications', 'organisation.create', 'organisation.update', 'organisation.addUser', 'organisation.updateUser', 'organisation.deleteUser', 'role.create', 'role.update', 'role.delete', 'user.updateRole')`);
        await queryRunner.query(`CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "permissions" "public"."role_permissions_enum" array NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "photo" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filename" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_723fa50bf70dcfd06fb5a44d4ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "address" ("id" SERIAL NOT NULL, "city" character varying NOT NULL, "country" character varying NOT NULL, "zip" character varying NOT NULL, "street" character varying NOT NULL, "house_number" character varying NOT NULL, CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_gender_enum" AS ENUM('male', 'female', 'non-binary', 'prefer-not-to-say')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "username" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "birth_date" TIMESTAMP, "nationality" character varying, "phone_prefix" character varying, "phone_number" character varying, "gender" "public"."user_gender_enum" NOT NULL DEFAULT 'prefer-not-to-say', "pronouns" character varying, "password" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_verified" boolean NOT NULL DEFAULT false, "photo_id" uuid, "personal_address_id" integer, "role_id" integer, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_78a916df40e02a9deb1c4b75ed" ON "user" ("username") `);
        await queryRunner.query(`CREATE INDEX "IDX_f4ca2c1e7c96ae6e8a7cca9df8" ON "user" ("email", "username") `);
        await queryRunner.query(`CREATE TABLE "organization_member" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "organization_id" uuid, "user_id" uuid NOT NULL, CONSTRAINT "PK_81dbbb093cbe0539c170f3d1484" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "organization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "cin" character varying, "vatin" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "address_id" integer NOT NULL, "manager_id" uuid, "parent_id" uuid, CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_15acafd6698ac846c6b6a6a50e" ON "organization" ("parent_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_single_root" ON "organization" ("id") WHERE parent_id IS NULL`);
        await queryRunner.query(`CREATE TABLE "event_custom_organization" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "country" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "application_id" integer NOT NULL, CONSTRAINT "REL_7713df0ec5af5093cd5bfc980c" UNIQUE ("application_id"), CONSTRAINT "PK_1326cfa656b9a41081bd4435861" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."event_spot_currency_enum" AS ENUM('CZK', 'EUR')`);
        await queryRunner.query(`CREATE TABLE "event_spot" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "price" integer NOT NULL, "currency" "public"."event_spot_currency_enum" NOT NULL DEFAULT 'CZK', "event_id" integer, CONSTRAINT "PK_9ce1b9c12794bb8e915e4be19b4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."InvoiceMethods" AS ENUM('personal', 'organisation', 'different')`);
        await queryRunner.query(`CREATE TABLE "event_application" ("id" SERIAL NOT NULL, "additional_data" json NOT NULL DEFAULT '{}', "invoice_method" "public"."InvoiceMethods" NOT NULL DEFAULT 'personal', "invoiced_to" character varying, "additional_information" character varying, "food_restriction_allergies" character varying, "health_limitations" character varying, "valid_until" TIMESTAMP, "id_number" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "event_id" integer NOT NULL, "organization_id" uuid, "spot_type_id" integer, "personal_address_id" integer, "invoice_address_id" integer, CONSTRAINT "UQ_9d199138fbb3111d36af9764c56" UNIQUE ("user_id", "event_id"), CONSTRAINT "REL_d95eaed3aced256304db27b502" UNIQUE ("personal_address_id"), CONSTRAINT "REL_9582f0b3884fbf4b36e6853387" UNIQUE ("invoice_address_id"), CONSTRAINT "PK_1e1754ebb2fbf400511a36335ae" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event_link" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "link" character varying NOT NULL, "event_id" integer, CONSTRAINT "PK_876946eee7cfae7d33d88610630" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "short_description" character varying NOT NULL, "long_description" character varying NOT NULL, "since" TIMESTAMP NOT NULL, "until" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "visible" boolean NOT NULL DEFAULT true, "registration_deadline" TIMESTAMP NOT NULL, "generate_invoices" boolean NOT NULL DEFAULT true, "registration_form" json, "capacity" integer NOT NULL, "terms_and_conditions_link" character varying NOT NULL, "photo_policy_link" character varying NOT NULL, "code_of_conduct_link" character varying NOT NULL, "created_by_user_id" uuid NOT NULL, "photo_id" uuid, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_2863d588f4efce8bf42c9c63526" FOREIGN KEY ("photo_id") REFERENCES "photo"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_23dadf77c4260012ffc54ebce52" FOREIGN KEY ("personal_address_id") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_member" ADD CONSTRAINT "FK_ce08825728e5afefdc6e682b8d7" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_member" ADD CONSTRAINT "FK_273aa659a4afdcb614cdecbd667" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization" ADD CONSTRAINT "FK_0f31fe3925535afb5462326d7d6" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization" ADD CONSTRAINT "FK_910e87ddd1c8e02d1bcb06c4acb" FOREIGN KEY ("manager_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization" ADD CONSTRAINT "FK_15acafd6698ac846c6b6a6a50ec" FOREIGN KEY ("parent_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_custom_organization" ADD CONSTRAINT "FK_7713df0ec5af5093cd5bfc980c5" FOREIGN KEY ("application_id") REFERENCES "event_application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_spot" ADD CONSTRAINT "FK_f11312dbb69a7a9f8d29e46ebd5" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_application" ADD CONSTRAINT "FK_80b0bce50278f872e5dd8ea4a60" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_application" ADD CONSTRAINT "FK_54e6a03180415ff1924f2b50633" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_application" ADD CONSTRAINT "FK_5bd09781ea23eeb0decf666193d" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_application" ADD CONSTRAINT "FK_77581fd0d935f0d798d8d8cc12b" FOREIGN KEY ("spot_type_id") REFERENCES "event_spot"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_application" ADD CONSTRAINT "FK_d95eaed3aced256304db27b502d" FOREIGN KEY ("personal_address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_application" ADD CONSTRAINT "FK_9582f0b3884fbf4b36e68533877" FOREIGN KEY ("invoice_address_id") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_link" ADD CONSTRAINT "FK_814b7f00bd77e16d112f89764a4" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_161f205c6980d03ac6cf26169a1" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_ca1a36a8d665ae39e85cfcf6f91" FOREIGN KEY ("photo_id") REFERENCES "photo"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_ca1a36a8d665ae39e85cfcf6f91"`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_161f205c6980d03ac6cf26169a1"`);
        await queryRunner.query(`ALTER TABLE "event_link" DROP CONSTRAINT "FK_814b7f00bd77e16d112f89764a4"`);
        await queryRunner.query(`ALTER TABLE "event_application" DROP CONSTRAINT "FK_9582f0b3884fbf4b36e68533877"`);
        await queryRunner.query(`ALTER TABLE "event_application" DROP CONSTRAINT "FK_d95eaed3aced256304db27b502d"`);
        await queryRunner.query(`ALTER TABLE "event_application" DROP CONSTRAINT "FK_77581fd0d935f0d798d8d8cc12b"`);
        await queryRunner.query(`ALTER TABLE "event_application" DROP CONSTRAINT "FK_5bd09781ea23eeb0decf666193d"`);
        await queryRunner.query(`ALTER TABLE "event_application" DROP CONSTRAINT "FK_54e6a03180415ff1924f2b50633"`);
        await queryRunner.query(`ALTER TABLE "event_application" DROP CONSTRAINT "FK_80b0bce50278f872e5dd8ea4a60"`);
        await queryRunner.query(`ALTER TABLE "event_spot" DROP CONSTRAINT "FK_f11312dbb69a7a9f8d29e46ebd5"`);
        await queryRunner.query(`ALTER TABLE "event_custom_organization" DROP CONSTRAINT "FK_7713df0ec5af5093cd5bfc980c5"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP CONSTRAINT "FK_15acafd6698ac846c6b6a6a50ec"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP CONSTRAINT "FK_910e87ddd1c8e02d1bcb06c4acb"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP CONSTRAINT "FK_0f31fe3925535afb5462326d7d6"`);
        await queryRunner.query(`ALTER TABLE "organization_member" DROP CONSTRAINT "FK_273aa659a4afdcb614cdecbd667"`);
        await queryRunner.query(`ALTER TABLE "organization_member" DROP CONSTRAINT "FK_ce08825728e5afefdc6e682b8d7"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_23dadf77c4260012ffc54ebce52"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_2863d588f4efce8bf42c9c63526"`);
        await queryRunner.query(`DROP TABLE "event"`);
        await queryRunner.query(`DROP TABLE "event_link"`);
        await queryRunner.query(`DROP TABLE "event_application"`);
        await queryRunner.query(`DROP TYPE "public"."InvoiceMethods"`);
        await queryRunner.query(`DROP TABLE "event_spot"`);
        await queryRunner.query(`DROP TYPE "public"."event_spot_currency_enum"`);
        await queryRunner.query(`DROP TABLE "event_custom_organization"`);
        await queryRunner.query(`DROP INDEX "public"."idx_single_root"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_15acafd6698ac846c6b6a6a50e"`);
        await queryRunner.query(`DROP TABLE "organization"`);
        await queryRunner.query(`DROP TABLE "organization_member"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f4ca2c1e7c96ae6e8a7cca9df8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_78a916df40e02a9deb1c4b75ed"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_gender_enum"`);
        await queryRunner.query(`DROP TABLE "address"`);
        await queryRunner.query(`DROP TABLE "photo"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TYPE "public"."role_permissions_enum"`);
    }

}
