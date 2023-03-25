import {StubDateProvider} from "./stub-date-provider";
import {InMemoryMessageRepository} from "./message.inmemory.repository";
import {PostMessageCommand, PostMessageUseCase} from "../post-message.usecase";
import {Message} from "../message";
import {ViewTimeLineUseCase} from "../view-timeline.usecase";

export const createMessagingFixture = () => {
    const dateProvider = new StubDateProvider();
    const messageRepository = new InMemoryMessageRepository();
    const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
    const viewTimeLineUseCase = new ViewTimeLineUseCase(
        messageRepository, dateProvider);
    let timeline: {author: string; text: string; publicationTime: string}[];
    let thrownError: Error;
    return {
        givenTheFollowingMessagesExist(messages: Message[]){
            messageRepository.givenExistingMessages(messages);
        },
        givenNowIs(now: Date){
            dateProvider.now = now
        },
        async whenTheUserSeeTheTimeLineOf(user: string){
            timeline = await viewTimeLineUseCase.handle({ user });
        },
        async whenAUserPostAMessage(postMessageCommand: PostMessageCommand){
            try {
                await postMessageUseCase.handle(postMessageCommand);
            }catch(err){
                thrownError = err;
            }
        },
        async whenUserEditsMessage(editMessageCommand: {messageId: string; text: string}) {
            
        },
        thenMessageShouldBe(expectedMessage: Message){
            expect(expectedMessage).toEqual(messageRepository.getMessageById(expectedMessage.id));
        },
        thenErrorShouldBe(expectedErrorClass: new () => Error ) {
            expect(thrownError).toBeInstanceOf(expectedErrorClass);
        },
        thenUserShouldSee(expectedTimeline: {author: string; text: string; publicationTime: string}[]){
            expect(timeline).toEqual(expectedTimeline);
        }
    }
}

export type MessagingFixture = ReturnType<typeof createMessagingFixture>;

