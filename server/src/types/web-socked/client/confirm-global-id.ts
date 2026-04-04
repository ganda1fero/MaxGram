import type { UUID } from "node:crypto";

export type ConfirmGlobalId = {
    type: 'CONFIRM_GLOBAL_ID',
    localId: UUID,
};