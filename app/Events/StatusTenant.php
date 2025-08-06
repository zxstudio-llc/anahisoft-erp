<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class StatusTenant implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $tenantId;
    public bool $isActive;
    public string $message;

    /**
     * Create a new event instance.
     */
    public function __construct(string $tenantId, bool $isActive, string $message)
    {
        $this->tenantId = $tenantId;
        $this->isActive = $isActive;
        $this->message = $message;
        
        // Log para debugging
        Log::info('StatusTenant event created', [
            'tenantId' => $tenantId,
            'isActive' => $isActive,
            'message' => $message,
            'broadcast_connection' => config('broadcasting.default')
        ]);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('tenant.status'),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'tenantId' => $this->tenantId,
            'isActive' => $this->isActive,
            'message' => $this->message,
        ];
    }

    /**
     * Get the event name.
     */
    public function broadcastAs(): string
    {
        return 'TenantStatusChanged';
    }
}
