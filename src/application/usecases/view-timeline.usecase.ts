import {MessageRepository} from "../message.repository";
import {DateProvider} from "../date.provider";
import {Timeline} from "../../domain/timeline";
import {TimelinePresenter} from "../../apps/timeline.presenter";

export class ViewTimeLineUseCase{

    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly dateProvider: DateProvider) {}
    async handle({ user }: { user: string }, timelinePresenter: TimelinePresenter ): Promise<void>{
            const messagesOfUser = await this.messageRepository.getAllOfUser(user);
            const timeline = new Timeline(messagesOfUser);
            timelinePresenter.show(timeline);
    }
}