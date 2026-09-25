<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $page = (int) $request->input('page', 1);
        $perPage = (int) $request->input('per_page', 20);

        $result = NotificationService::getUserNotifs($user->id, $perPage, $page);

        return response()->json([
            'message' => 'Daftar notifikasi berhasil diambil.',
            'data' => $result['data'],
            'pagination' => $result['pagination'],
        ]);
    }

    public function unreadCount(Request $request)
    {
        $count = NotificationService::getUnreadCount($request->user()->id);

        return response()->json([
            'unread_count' => $count,
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $success = NotificationService::markAsRead((int) $id, $request->user()->id);

        if (!$success) {
            return response()->json(['message' => 'Notifikasi tidak ditemukan atau sudah dibaca.'], 404);
        }

        return response()->json(['message' => 'Notifikasi ditandai sudah dibaca.']);
    }

    public function markAllAsRead(Request $request)
    {
        $count = NotificationService::markAllAsRead($request->user()->id);

        return response()->json([
            'message' => 'Semua notifikasi ditandai sudah dibaca.',
            'updated' => $count,
        ]);
    }
}
