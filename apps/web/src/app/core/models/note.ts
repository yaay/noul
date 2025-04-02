export interface note {
    id: number;
    created: Date;
    content: string;
    threadId: number;
    is_online: boolean;
    is_local: boolean;
    is_edit?: boolean;
}