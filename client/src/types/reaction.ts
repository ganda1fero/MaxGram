export type MessageReactionType = 'like' | 'dislike';

export type MessageReaction = {
    id: string,
    ownerId: string,
    type: MessageReactionType,
    timestamp: number,
}