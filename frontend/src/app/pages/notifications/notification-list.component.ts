import { Component, OnInit, OnDestroy,AfterViewInit } from '@angular/core';
import { NotificationService, Notification } from '../../core/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements  OnDestroy {
  notifications: Notification[] = [];
  unreadCount: number = 0;
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  AfterViewInit(): void {
    this.subscription.add(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
      })
    );

    this.subscription.add(
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      })
    );

    // Initial fetch
    this.notificationService.fetchNotifications().subscribe();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  markAsRead(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }

  getNotificationMessage(notification: Notification): string {
    switch (notification.type) {
      case 'mention':
        return 'mentioned you in a post';
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      case 'repost':
        return 'reposted your post';
      default:
        return 'interacted with you';
    }
  }
}
