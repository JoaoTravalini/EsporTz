import { Table, TableIndex, TableForeignKey } from "typeorm";
export class CreateMentionTable1700000000001 {
    async up(queryRunner) {
        // Create mention table
        await queryRunner.createTable(new Table({
            name: "mention",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "gen_random_uuid()"
                },
                {
                    name: "postId",
                    type: "uuid",
                    isNullable: false
                },
                {
                    name: "mentionedUserId",
                    type: "uuid",
                    isNullable: false
                },
                {
                    name: "position",
                    type: "int",
                    default: 0,
                    isNullable: false
                },
                {
                    name: "context",
                    type: "varchar",
                    length: "100",
                    isNullable: true
                },
                {
                    name: "created_at",
                    type: "timestamptz",
                    default: "now()",
                    isNullable: false
                },
                {
                    name: "updated_at",
                    type: "timestamptz",
                    default: "now()",
                    isNullable: false
                }
            ]
        }), true);
        // Create unique constraint to prevent duplicate mentions
        await queryRunner.createIndex("mention", new TableIndex({
            name: "IDX_MENTION_POST_USER_UNIQUE",
            columnNames: ["postId", "mentionedUserId"],
            isUnique: true
        }));
        // Create index on postId for fast lookups
        await queryRunner.createIndex("mention", new TableIndex({
            name: "IDX_MENTION_POST",
            columnNames: ["postId"]
        }));
        // Create index on mentionedUserId for fast lookups
        await queryRunner.createIndex("mention", new TableIndex({
            name: "IDX_MENTION_USER",
            columnNames: ["mentionedUserId"]
        }));
        // Add foreign key to post table
        await queryRunner.createForeignKey("mention", new TableForeignKey({
            columnNames: ["postId"],
            referencedColumnNames: ["id"],
            referencedTableName: "post",
            onDelete: "CASCADE"
        }));
        // Add foreign key to user table
        await queryRunner.createForeignKey("mention", new TableForeignKey({
            columnNames: ["mentionedUserId"],
            referencedColumnNames: ["id"],
            referencedTableName: "user",
            onDelete: "CASCADE"
        }));
    }
    async down(queryRunner) {
        // Drop foreign keys
        const mentionTable = await queryRunner.getTable("mention");
        if (mentionTable) {
            const foreignKeys = mentionTable.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("mention", foreignKey);
            }
        }
        // Drop indexes
        await queryRunner.dropIndex("mention", "IDX_MENTION_USER");
        await queryRunner.dropIndex("mention", "IDX_MENTION_POST");
        await queryRunner.dropIndex("mention", "IDX_MENTION_POST_USER_UNIQUE");
        // Drop table
        await queryRunner.dropTable("mention");
    }
}
//# sourceMappingURL=1700000000001-CreateMentionTable.js.map