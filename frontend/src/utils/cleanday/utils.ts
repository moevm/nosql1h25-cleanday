import { CleandayStatus } from "@models/Cleanday.ts";

export const getStatusColor = (status: CleandayStatus) => {
    switch (status) {
        case CleandayStatus.planned:
            return 'primary';
        case CleandayStatus.onGoing:
            return 'info';
        case CleandayStatus.completed:
            return 'success';
        case CleandayStatus.cancelled:
            return 'error';
        case CleandayStatus.rescheduled:
            return 'warning';
        default:
            return 'default';
    }
};
