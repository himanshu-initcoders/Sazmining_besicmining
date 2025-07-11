import { MigrationInterface, QueryRunner } from "typeorm";

export class AuctionEntityImprovements1752230264367 implements MigrationInterface {
    name = 'AuctionEntityImprovements1752230264367'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, add the new columns as nullable with default values
        await queryRunner.query(`ALTER TABLE "auctions" ADD "startingPrice" double precision`);
        await queryRunner.query(`ALTER TABLE "auctions" ADD "startDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "auctions" ADD "endDate" TIMESTAMP`);
        
        // Update existing records with data from productPrice and default dates
        await queryRunner.query(`
            UPDATE "auctions" 
            SET 
                "startingPrice" = "productPrice",
                "startDate" = CURRENT_TIMESTAMP,
                "endDate" = CURRENT_TIMESTAMP + INTERVAL '7 days'
            WHERE "startingPrice" IS NULL
        `);
        
        // Now make the columns NOT NULL
        await queryRunner.query(`ALTER TABLE "auctions" ALTER COLUMN "startingPrice" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auctions" ALTER COLUMN "startDate" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auctions" ALTER COLUMN "endDate" SET NOT NULL`);
        
        // Finally, drop the old columns
        await queryRunner.query(`ALTER TABLE "auctions" DROP COLUMN "productPrice"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "auctionStartDate"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "auctionEndDate"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverse the changes
        await queryRunner.query(`ALTER TABLE "products" ADD "auctionStartDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "products" ADD "auctionEndDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "auctions" ADD "productPrice" double precision`);
        
        // Copy data back
        await queryRunner.query(`
            UPDATE "auctions" 
            SET "productPrice" = "startingPrice"
            WHERE "productPrice" IS NULL
        `);
        
        await queryRunner.query(`ALTER TABLE "auctions" ALTER COLUMN "productPrice" SET NOT NULL`);
        
        // Drop the new columns
        await queryRunner.query(`ALTER TABLE "auctions" DROP COLUMN "endDate"`);
        await queryRunner.query(`ALTER TABLE "auctions" DROP COLUMN "startDate"`);
        await queryRunner.query(`ALTER TABLE "auctions" DROP COLUMN "startingPrice"`);
    }
}
