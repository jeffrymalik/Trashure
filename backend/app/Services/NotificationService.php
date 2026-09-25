<?php

namespace App\Services;

use App\Models\Notification;
use Illuminate\Support\Facades\DB;

class NotificationService
{
    public static function send(int $userId, string $title, string $message, string $type, ?array $data = null): Notification
    {
        return Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'data' => $data,
        ]);
    }

    public static function sendToMany(array $userIds, string $title, string $message, string $type, ?array $data = null): void
    {
        $records = array_map(fn(int $userId) => [
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'data' => $data,
            'created_at' => now(),
            'updated_at' => now(),
        ], array_unique($userIds));

        DB::table('notifications')->insert($records);
    }

    public static function markAsRead(int $notificationId, int $userId): bool
    {
        $updated = Notification::where('id', $notificationId)
            ->where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $updated > 0;
    }

    public static function markAllAsRead(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public static function getUnreadCount(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->count();
    }

    public static function getUserNotifs(int $userId, int $limit = 20, int $page = 1)
    {
        $query = Notification::where('user_id', $userId)
            ->orderByDesc('created_at');

        $total = $query->count();
        $notifs = $query->skip(($page - 1) * $limit)
            ->take($limit)
            ->get();

        return [
            'data' => $notifs,
            'pagination' => [
                'current_page' => $page,
                'total' => $total,
                'per_page' => $limit,
                'last_page' => (int) ceil($total / $limit),
            ],
        ];
    }
}
