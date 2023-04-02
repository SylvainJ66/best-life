import {MessageRepository} from "../message.repository";
import {Message} from "../../domain/message";
import {DateProvider} from "../date.provider";

export class PostMessageUseCase{
    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly dateProvider: DateProvider){}
    async handle(postMessageCommand: PostMessageCommand){
        await this.messageRepository.save(Message.fromData({
            id: postMessageCommand.id,
            author: postMessageCommand.author,
            text: postMessageCommand.text,
            publishedAt: this.dateProvider.getNow(),
        }));
    }
}

export type PostMessageCommand = { author: string; id: string; text: string };