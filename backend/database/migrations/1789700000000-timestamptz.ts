import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Columns written by the API from JS `Date` objects. node-postgres serialised them
 * in the API process timezone (TZ=Europe/Prague).
 */
const APP_ZONE = "Europe/Prague";
const appColumns: [table: string, column: string][] = [
  ["event", "since"],
  ["event", "until"],
  ["event", "registration_deadline"],
  ["event", "priority_list_deadline"],
  ["event_application", "valid_until"],
  ["user", "birth_date"],
];

/**
 * Columns filled by `DEFAULT now()` / `CURRENT_TIMESTAMP`, evaluated in the database
 * session timezone (UTC unless the server was configured otherwise).
 */
const DB_ZONE = "UTC";
const dbColumns: [table: string, column: string][] = [
  ["photo", "created_at"],
  ["user", "created_at"],
  ["user", "updated_at"],
  ["organization_member", "created_at"],
  ["organization", "created_at"],
  ["event_custom_organization", "created_at"],
  ["event_application", "created_at"],
  ["event", "created_at"],
  ["sugar_cube", "created_at"],
  ["settings", "created_at"],
  ["settings", "updated_at"],
];

export class Timestamptz1789700000000 implements MigrationInterface {
  name = "Timestamptz1789700000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [table, column] of appColumns) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE TIMESTAMP WITH TIME ZONE USING "${column}" AT TIME ZONE '${APP_ZONE}'`,
      );
    }
    for (const [table, column] of dbColumns) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE TIMESTAMP WITH TIME ZONE USING "${column}" AT TIME ZONE '${DB_ZONE}'`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const [table, column] of appColumns) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE TIMESTAMP USING "${column}" AT TIME ZONE '${APP_ZONE}'`,
      );
    }
    for (const [table, column] of dbColumns) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE TIMESTAMP USING "${column}" AT TIME ZONE '${DB_ZONE}'`,
      );
    }
  }
}
