import { Router } from "express";
import { AppDataSource } from "../../../database/postgres/data-source.js";
import { Notification } from "../../../database/postgres/entities/notification-entity.js";
import { asyncHandler } from "../utils/async-handler.js";
const router = Router();
const notificationRepository = AppDataSource.getRepository(Notification);
// Get notifications for the authenticated user
router.get("/", asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    const skip = (page - 1) * limit;
    const [notifications, total] = await notificationRepository.findAndCount({
        where: { recipientId: userId },
        relations: ["actor", "post"],
        order: { createdAt: "DESC" },
        skip,
        take: limit
    });
    const unreadCount = await notificationRepository.count({
        where: { recipientId: userId, read: false }
    });
    return res.json({
        notifications: notifications.map(n => ({
            id: n.id,
            type: n.type,
            actor: {
                id: n.actor.id,
                name: n.actor.name,
                username: n.actor.email.split('@')[0], // Simple username derivation
                avatar: n.actor.imgURL
            },
            post: n.post ? {
                id: n.post.id,
                content: n.post.content
            } : null,
            read: n.read,
            createdAt: n.createdAt
        })),
        unreadCount,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
}));
// Mark a notification as read
router.patch("/:id/read", asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const notification = await notificationRepository.findOne({
        where: { id, recipientId: userId }
    });
    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }
    notification.read = true;
    await notificationRepository.save(notification);
    return res.json({ message: "Notification marked as read" });
}));
// Mark all notifications as read
router.patch("/read-all", asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    await notificationRepository.update({ recipientId: userId, read: false }, { read: true });
    return res.json({ message: "All notifications marked as read" });
}));
export const notificationsRouter = router;
//# sourceMappingURL=notifications-controller.js.map