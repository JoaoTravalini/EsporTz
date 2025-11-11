import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateHashtagTable1699999999999 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create hashtag table
        await queryRunner.createTable(
            new Table({
                name: "hashtag",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "gen_random_uuid()"
                    },
                    {
                        name: "tag",
                        type: "varchar",
                        length: "50",
                        isUnique: true,
                        isNullable: false
                    },
                    {
                        name: "displayTag",
                        type: "varchar",
                        length: "50",
                        isNullable: false
                    },
                    {
                        name: "postCount",
                        type: "int",
                        default: 0,
                        isNullable: false
                    },
                    {
                        name: "lastUsedAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        isNullable: false
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
            }),
            true
        );

        // Create index on tag for fast lookups
        await queryRunner.createIndex(
            "hashtag",
            new TableIndex({
                name: "IDX_HASHTAG_TAG",
                columnNames: ["tag"]
            })
        );

        // Create post_hashtags join table
        await queryRunner.createTable(
            new Table({
                name: "post_hashtags",
                columns: [
                    {
                        name: "postId",
                        type: "uuid",
                        isNullable: false
                    },
                    {
                        name: "hashtagId",
                        type: "uuid",
                        isNullable: false
                    }
                ]
            }),
            true
        );

        // Create indexes on join table
        await queryRunner.createIndex(
            "post_hashtags",
            new TableIndex({
                name: "IDX_POST_HASHTAGS_POST",
                columnNames: ["postId"]
            })
        );

        await queryRunner.createIndex(
            "post_hashtags",
            new TableIndex({
                name: "IDX_POST_HASHTAGS_HASHTAG",
                columnNames: ["hashtagId"]
            })
        );

        // Add foreign keys
        await queryRunner.createForeignKey(
            "post_hashtags",
            new TableForeignKey({
                columnNames: ["postId"],
                referencedColumnNames: ["id"],
                referencedTableName: "post",
                onDelete: "CASCADE"
            })
        );

        await queryRunner.createForeignKey(
            "post_hashtags",
            new TableForeignKey({
                columnNames: ["hashtagId"],
                referencedColumnNames: ["id"],
                referencedTableName: "hashtag",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys
        const postHashtagsTable = await queryRunner.getTable("post_hashtags");
        if (postHashtagsTable) {
            const foreignKeys = postHashtagsTable.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("post_hashtags", foreignKey);
            }
        }

        // Drop indexes
        await queryRunner.dropIndex("post_hashtags", "IDX_POST_HASHTAGS_HASHTAG");
        await queryRunner.dropIndex("post_hashtags", "IDX_POST_HASHTAGS_POST");
        await queryRunner.dropIndex("hashtag", "IDX_HASHTAG_TAG");

        // Drop tables
        await queryRunner.dropTable("post_hashtags");
        await queryRunner.dropTable("hashtag");
    }
}
