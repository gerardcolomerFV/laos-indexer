module.exports = class Data1720614033898 {
    name = 'Data1720614033898'

    async up(db) {
        await db.query(`CREATE TABLE "transfer" ("id" character varying NOT NULL, "from" text NOT NULL, "to" text NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "block_number" integer NOT NULL, "tx_hash" text NOT NULL, "asset_id" character varying, CONSTRAINT "PK_fd9ddbdd49a17afcbe014401295" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_e818cd083f48ed773afe017f7c" ON "transfer" ("asset_id") `)
        await db.query(`CREATE INDEX "IDX_f605a03972b4f28db27a0ee70d" ON "transfer" ("tx_hash") `)
        await db.query(`CREATE TABLE "asset" ("id" character varying NOT NULL, "token_id" numeric NOT NULL, "owner" text NOT NULL, "ownership_contract_id" character varying, CONSTRAINT "PK_1209d107fe21482beaea51b745e" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_dc1699251752ca3b19442d8800" ON "asset" ("ownership_contract_id") `)
        await db.query(`CREATE TABLE "ownership_contract" ("id" character varying NOT NULL, "laos_contract" text, CONSTRAINT "PK_6ef3226ceefbd82ad30b9075bdf" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_940175c34e4f87552f002f428a" ON "ownership_contract" ("laos_contract") `)
        await db.query(`CREATE TABLE "laos_asset" ("id" character varying NOT NULL, "laos_contract" text NOT NULL, "token_id" numeric NOT NULL, "initial_owner" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "log_index" integer NOT NULL, "metadata" text, CONSTRAINT "PK_b922ae1a317644c470a64c7174f" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_ff8a3b3470ab42f6d7d20f9d84" ON "laos_asset" ("laos_contract") `)
        await db.query(`CREATE INDEX "IDX_e4e4978a0c9d154a00e1ad3830" ON "laos_asset" ("metadata") `)
        await db.query(`CREATE TABLE "token_uri" ("id" character varying NOT NULL, "state" text NOT NULL, "name" text, "description" text, "image" text, "attributes" jsonb, "fetched" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_1f5797cb07d9a79407a00292363" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "metadata" ("id" character varying NOT NULL, "block_number" integer NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "tx_hash" text NOT NULL, "laos_asset_id" character varying, "token_uri_id" character varying, CONSTRAINT "PK_56b22355e89941b9792c04ab176" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_90484e3241344e9b970c82ea67" ON "metadata" ("laos_asset_id") `)
        await db.query(`CREATE INDEX "IDX_d14ff181d0e754aba6f171d59b" ON "metadata" ("token_uri_id") `)
        await db.query(`CREATE INDEX "IDX_78be4c41c64f3ec6913882574b" ON "metadata" ("tx_hash") `)
        await db.query(`ALTER TABLE "transfer" ADD CONSTRAINT "FK_e818cd083f48ed773afe017f7c0" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "asset" ADD CONSTRAINT "FK_dc1699251752ca3b19442d8800e" FOREIGN KEY ("ownership_contract_id") REFERENCES "ownership_contract"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "metadata" ADD CONSTRAINT "FK_90484e3241344e9b970c82ea67d" FOREIGN KEY ("laos_asset_id") REFERENCES "laos_asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "metadata" ADD CONSTRAINT "FK_d14ff181d0e754aba6f171d59bc" FOREIGN KEY ("token_uri_id") REFERENCES "token_uri"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "transfer"`)
        await db.query(`DROP INDEX "public"."IDX_e818cd083f48ed773afe017f7c"`)
        await db.query(`DROP INDEX "public"."IDX_f605a03972b4f28db27a0ee70d"`)
        await db.query(`DROP TABLE "asset"`)
        await db.query(`DROP INDEX "public"."IDX_dc1699251752ca3b19442d8800"`)
        await db.query(`DROP TABLE "ownership_contract"`)
        await db.query(`DROP INDEX "public"."IDX_940175c34e4f87552f002f428a"`)
        await db.query(`DROP TABLE "laos_asset"`)
        await db.query(`DROP INDEX "public"."IDX_ff8a3b3470ab42f6d7d20f9d84"`)
        await db.query(`DROP INDEX "public"."IDX_e4e4978a0c9d154a00e1ad3830"`)
        await db.query(`DROP TABLE "token_uri"`)
        await db.query(`DROP TABLE "metadata"`)
        await db.query(`DROP INDEX "public"."IDX_90484e3241344e9b970c82ea67"`)
        await db.query(`DROP INDEX "public"."IDX_d14ff181d0e754aba6f171d59b"`)
        await db.query(`DROP INDEX "public"."IDX_78be4c41c64f3ec6913882574b"`)
        await db.query(`ALTER TABLE "transfer" DROP CONSTRAINT "FK_e818cd083f48ed773afe017f7c0"`)
        await db.query(`ALTER TABLE "asset" DROP CONSTRAINT "FK_dc1699251752ca3b19442d8800e"`)
        await db.query(`ALTER TABLE "metadata" DROP CONSTRAINT "FK_90484e3241344e9b970c82ea67d"`)
        await db.query(`ALTER TABLE "metadata" DROP CONSTRAINT "FK_d14ff181d0e754aba6f171d59bc"`)
    }
}
