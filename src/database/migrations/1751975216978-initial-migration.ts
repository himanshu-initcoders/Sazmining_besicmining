import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1751975216978 implements MigrationInterface {
    name = 'InitialMigration1751975216978'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."products_type_enum" AS ENUM('marketplace', 'retail')`);
        await queryRunner.query(`CREATE TYPE "public"."products_cooling_enum" AS ENUM('air', 'liquid', 'immersion')`);
        await queryRunner.query(`CREATE TYPE "public"."products_productstatus_enum" AS ENUM('Online', 'Offline', 'Maintenance')`);
        await queryRunner.query(`CREATE TYPE "public"."products_status_enum" AS ENUM('Published', 'Draft', 'Pending')`);
        await queryRunner.query(`CREATE TYPE "public"."products_availability_enum" AS ENUM('In Stock', 'Out of Stock', 'Pre Order')`);
        await queryRunner.query(`CREATE TYPE "public"."products_auctiontype_enum" AS ENUM('Bid', 'Fixed')`);
        await queryRunner.query(`CREATE TYPE "public"."products_stocktype_enum" AS ENUM('limited', 'unlimited')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" SERIAL NOT NULL, "sku" character varying, "serialNumber" character varying NOT NULL, "modelName" character varying NOT NULL, "description" character varying NOT NULL, "imageUrl" character varying, "isActive" boolean NOT NULL DEFAULT true, "hashRate" double precision NOT NULL, "power" double precision NOT NULL, "efficiency" double precision NOT NULL, "disableBuyNow" boolean NOT NULL DEFAULT false, "type" "public"."products_type_enum" NOT NULL DEFAULT 'marketplace', "cooling" "public"."products_cooling_enum" NOT NULL DEFAULT 'air', "manufacturer" character varying NOT NULL, "productStatus" "public"."products_productstatus_enum" NOT NULL DEFAULT 'Online', "status" "public"."products_status_enum" NOT NULL DEFAULT 'Draft', "availability" "public"."products_availability_enum" NOT NULL DEFAULT 'In Stock', "askPrice" double precision NOT NULL, "auctionType" "public"."products_auctiontype_enum" NOT NULL DEFAULT 'Fixed', "auctionStartDate" TIMESTAMP, "auctionEndDate" TIMESTAMP, "contractId" character varying, "shippingPrice" double precision, "hosting" boolean NOT NULL DEFAULT false, "stockType" "public"."products_stocktype_enum" NOT NULL DEFAULT 'limited', "userId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cart_items" ("id" SERIAL NOT NULL, "cartId" integer NOT NULL, "productId" integer NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "carts" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_69828a178f152f157dcf2f70a8" UNIQUE ("userId"), CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "termsAgreed" boolean NOT NULL DEFAULT false, "username" character varying NOT NULL, "name" character varying NOT NULL, "phone" character varying, "profileCompletion" integer NOT NULL DEFAULT '0', "deviceToken" character varying, "profilePhoto" character varying, "password" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bids" ("id" SERIAL NOT NULL, "auctionId" integer NOT NULL, "bidUserId" integer NOT NULL, "bidPrice" double precision NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7950d066d322aab3a488ac39fe5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."auctions_auctionstatus_enum" AS ENUM('Pending', 'Active', 'Completed', 'Cancelled')`);
        await queryRunner.query(`CREATE TABLE "auctions" ("id" SERIAL NOT NULL, "productId" integer NOT NULL, "bidderId" integer, "publisherId" integer NOT NULL, "productPrice" double precision NOT NULL, "auctionStatus" "public"."auctions_auctionstatus_enum" NOT NULL DEFAULT 'Pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_87d2b34d4829f0519a5c5570368" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "contracts" ("id" SERIAL NOT NULL, "contractId" character varying NOT NULL, "location" character varying NOT NULL, "depositPrice" double precision NOT NULL, "setupPrice" double precision NOT NULL, "hostRate" double precision NOT NULL, "salesTaxPercent" double precision NOT NULL, CONSTRAINT "PK_2c7b8f3a7b1acdd49497d83d0fb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "isRevoked" boolean NOT NULL DEFAULT false, "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_edd714311619a5ad09525045838" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_72679d98b31c737937b8932ebe6" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "carts" ADD CONSTRAINT "FK_69828a178f152f157dcf2f70a89" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bids" ADD CONSTRAINT "FK_6d6b20987ed2f61e8801398f8d1" FOREIGN KEY ("auctionId") REFERENCES "auctions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bids" ADD CONSTRAINT "FK_39a5c80432fa96cb75133361710" FOREIGN KEY ("bidUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auctions" ADD CONSTRAINT "FK_1e69bf3176e83fc48ac6ffc6f93" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auctions" ADD CONSTRAINT "FK_24e057f5ab38b811aed92c94792" FOREIGN KEY ("bidderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auctions" ADD CONSTRAINT "FK_0f1ba2ad1d1dde2e98d45405db3" FOREIGN KEY ("publisherId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`);
        await queryRunner.query(`ALTER TABLE "auctions" DROP CONSTRAINT "FK_0f1ba2ad1d1dde2e98d45405db3"`);
        await queryRunner.query(`ALTER TABLE "auctions" DROP CONSTRAINT "FK_24e057f5ab38b811aed92c94792"`);
        await queryRunner.query(`ALTER TABLE "auctions" DROP CONSTRAINT "FK_1e69bf3176e83fc48ac6ffc6f93"`);
        await queryRunner.query(`ALTER TABLE "bids" DROP CONSTRAINT "FK_39a5c80432fa96cb75133361710"`);
        await queryRunner.query(`ALTER TABLE "bids" DROP CONSTRAINT "FK_6d6b20987ed2f61e8801398f8d1"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_69828a178f152f157dcf2f70a89"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_72679d98b31c737937b8932ebe6"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_edd714311619a5ad09525045838"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE "contracts"`);
        await queryRunner.query(`DROP TABLE "auctions"`);
        await queryRunner.query(`DROP TYPE "public"."auctions_auctionstatus_enum"`);
        await queryRunner.query(`DROP TABLE "bids"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "carts"`);
        await queryRunner.query(`DROP TABLE "cart_items"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_stocktype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."products_auctiontype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."products_availability_enum"`);
        await queryRunner.query(`DROP TYPE "public"."products_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."products_productstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."products_cooling_enum"`);
        await queryRunner.query(`DROP TYPE "public"."products_type_enum"`);
    }

}
