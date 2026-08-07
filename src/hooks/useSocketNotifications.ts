"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';

export function useSocketNotifications(userId?: number | null, vendorId?: number | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [lastOrderStatus, setLastOrderStatus] = useState<any | null>(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      if (userId) {
        socketInstance.emit('join_user_room', userId);
      }
      if (vendorId) {
        socketInstance.emit('join_vendor_room', vendorId);
      }
    });

    socketInstance.on('notification', (newNotif: any) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    socketInstance.on('order_status_updated', (data: any) => {
      setLastOrderStatus(data);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userId, vendorId]);

  return { socket, notifications, lastOrderStatus };
}
