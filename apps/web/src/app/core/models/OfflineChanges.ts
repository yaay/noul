export interface OfflineChanges {
    id: number;
    type: 'note' | 'thread';
    changeType: 'created' | 'updated' | 'delete';
    updatedAt?: Date;
}