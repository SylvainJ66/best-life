import {MessageRepository} from "./message.repository";

export class PostMessageUseCase{
    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly dateProvider: DateProvider){}
    async handle(postMessageCommand: PostMessageCommand){
        if(postMessageCommand.text.length > 280){
            throw new MessageTooLongError();
        }
        if(postMessageCommand.text.trim().length === 0){
            throw new EmptyMessageError();
        }
        await this.messageRepository.save({
            id: postMessageCommand.id,
            author: postMessageCommand.author,
            text: postMessageCommand.text,
            publishedAt: this.dateProvider.getNow()
        });
    }
}

export class MessageTooLongError extends Error{}
export class EmptyMessageError extends Error{}

export interface DateProvider{
    getNow(): Date;
}
export type PostMessageCommand = { author: string; id: string; text: string };