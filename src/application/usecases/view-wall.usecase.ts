import {MessageRepository} from "../message.repository";
import {FolloweeRepository} from "../followee.repository";
import {DateProvider} from "../date.provider";
import {Timeline} from "../../domain/timeline";
import {TimelinePresenter} from "../../apps/timeline.presenter";

export class ViewWallUseCase{
    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly followeeRepository: FolloweeRepository) {}
    async handle({ user }: { user: string }, timelinePresenter: TimelinePresenter): Promise<void>{
        const followees = await this.followeeRepository.getFolloweesOf(user)
        const messages = (await Promise.all(
            [user, ...followees].map((user) =>
                this.messageRepository.getAllOfUser(user)))).flat();
        const timeline = new Timeline(messages)
        timelinePresenter.show(timeline);
    };

}