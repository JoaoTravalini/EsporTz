import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddUserProfileFields1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add bio column
        await queryRunner.addColumn(
            "user",
            new TableColumn({
                name: "bio",
                type: "text",
                isNullable: true
            })
        );

        // Add location column
        await queryRunner.addColumn(
            "user",
            new TableColumn({
                name: "location",
                type: "varchar",
                length: "255",
                isNullable: true
            })
        );

        // Add website column
        await queryRunner.addColumn(
            "user",
            new TableColumn({
                name: "website",
                type: "varchar",
                length: "255",
                isNullable: true
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("user", "website");
        await queryRunner.dropColumn("user", "location");
        await queryRunner.dropColumn("user", "bio");
    }
}
