import type { MessageReactionType } from '../../reaction';

export type AddReaction = {
    chatId: string,
    messageId: string,
    type: MessageReactionType,
};