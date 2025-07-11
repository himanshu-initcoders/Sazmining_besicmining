import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveAuctionFieldsFromProduct1752231562113 implements MigrationInterface {
    name = 'RemoveAuctionFieldsFromProduct1752231562113'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "auctionType"`);
        await queryRunner.query(`DROP TYPE "public"."products_auctiontype_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."products_auctiontype_enum" AS ENUM('Bid', 'Fixed')`);
        await queryRunner.query(`ALTER TABLE "products" ADD "auctionType" "public"."products_auctiontype_enum" NOT NULL DEFAULT 'Fixed'`);
    }

}
