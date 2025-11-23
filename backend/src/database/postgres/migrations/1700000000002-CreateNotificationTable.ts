import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateNotificationTable1700000000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create notification table
        await queryRunner.createTable(
            new Table({
                name: "notification",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "gen_random_uuid()"
                    },
                    {
                        name: "recipientId",
                        type: "uuid",
                        isNullable: false
                    },
                    {
                        name: "actorId",
                        type: "uuid",
                        isNullable: false
                    },
                    {
                        name: "type",
                        type: "varchar",
                        length: "20",
                        isNullable: false
                    },
                    {
                        name: "postId",
                        type: "uuid",
                        isNullable: true
                    },
                    {
                        name: "read",
                        type: "boolean",
                        default: false,
                        isNullable: false
                    },
                    {
                        name: "message",
                        type: "text",
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
            }),
            true
        );

        // Create index on recipientId for fast lookups of user notifications
        await queryRunner.createIndex(
            "notification",
            new TableIndex({
                name: "IDX_NOTIFICATION_RECIPIENT",
                columnNames: ["recipientId"]
            })
        );

        // Create index on read status for filtering unread notifications
        await queryRunner.createIndex(
            "notification",
            new TableIndex({
                name: "IDX_NOTIFICATION_READ",
                columnNames: ["read"]
            })
        );

        // Create index on created_at for sorting by date
        await queryRunner.createIndex(
            "notification",
            new TableIndex({
                name: "IDX_NOTIFICATION_CREATED",
                columnNames: ["created_at"]
            })
        );

        // Create composite index for common query pattern (recipient + read + date)
        await queryRunner.createIndex(
            "notification",
            new TableIndex({
                name: "IDX_NOTIFICATION_RECIPIENT_READ_DATE",
                columnNames: ["recipientId", "read", "created_at"]
            })
        );

        // Add foreign key to user table (recipient)
        await queryRunner.createForeignKey(
            "notification",
            new TableForeignKey({
                columnNames: ["recipientId"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
                onDelete: "CASCADE"
            })
        );

        // Add foreign key to user table (actor)
        await queryRunner.createForeignKey(
            "notification",
            new TableForeignKey({
                columnNames: ["actorId"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
                onDelete: "CASCADE"
            })
        );

        // Add foreign key to post table (optional)
        await queryRunner.createForeignKey(
            "notification",
            new TableForeignKey({
                columnNames: ["postId"],
                referencedColumnNames: ["id"],
                referencedTableName: "post",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys
        const notificationTable = await queryRunner.getTable("notification");
        if (notificationTable) {
            const foreignKeys = notificationTable.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("notification", foreignKey);
            }
        }

        // Drop indexes
        await queryRunner.dropIndex("notification", "IDX_NOTIFICATION_RECIPIENT_READ_DATE");
        await queryRunner.dropIndex("notification", "IDX_NOTIFICATION_CREATED");
        await queryRunner.dropIndex("notification", "IDX_NOTIFICATION_READ");
        await queryRunner.dropIndex("notification", "IDX_NOTIFICATION_RECIPIENT");

        // Drop table
        await queryRunner.dropTable("notification");
    }
}
