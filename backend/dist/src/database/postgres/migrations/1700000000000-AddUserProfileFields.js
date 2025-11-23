import { TableColumn } from "typeorm";
export class AddUserProfileFields1700000000000 {
    async up(queryRunner) {
        // Add bio column
        await queryRunner.addColumn("user", new TableColumn({
            name: "bio",
            type: "text",
            isNullable: true
        }));
        // Add location column
        await queryRunner.addColumn("user", new TableColumn({
            name: "location",
            type: "varchar",
            length: "255",
            isNullable: true
        }));
        // Add website column
        await queryRunner.addColumn("user", new TableColumn({
            name: "website",
            type: "varchar",
            length: "255",
            isNullable: true
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn("user", "website");
        await queryRunner.dropColumn("user", "location");
        await queryRunner.dropColumn("user", "bio");
    }
}
//# sourceMappingURL=1700000000000-AddUserProfileFields.js.map