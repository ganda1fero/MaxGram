import type { UUID } from "@/types/UUID"

export type ConfirmGlobalId = {
    type: 'CONFIRM_GLOBAL_ID',
    localId: UUID,
};