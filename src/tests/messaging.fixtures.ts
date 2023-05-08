import {StubDateProvider} from "../infra/stub-date-provider";
import {InMemoryMessageRepository} from "../infra/message.inmemory.repository";
import {PostMessageCommand, PostMessageUseCase} from "../application/usecases/post-message.usecase";
import {Message} from "../domain/message";
import {ViewTimeLineUseCase} from "../application/usecases/view-timeline.usecase";
import {EditMessageCommand, EditMessageUsecase} from "../application/usecases/edit-message.usecase";

export const createMessagingFixture = () => {
    const dateProvider = new StubDateProvider();
    const messageRepository = new InMemoryMessageRepository();
    const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
    const viewTimeLineUseCase = new ViewTimeLineUseCase(
        messageRepository, dateProvider);
    const editMessageUseCase = new EditMessageUsecase(messageRepository);
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
        async whenUserEditsMessage(editMessageCommand: EditMessageCommand) {
            try{
                await editMessageUseCase.handle(editMessageCommand);
            }catch(err){
                thrownError = err;
            }
        },
        async thenMessageShouldBe(expectedMessage: Message){
            const message = await messageRepository.getById(expectedMessage.id);
            expect(message).toEqual(expectedMessage);
        },
        thenErrorShouldBe(expectedErrorClass: new () => Error ) {
            expect(thrownError).toBeInstanceOf(expectedErrorClass);
        },
        thenUserShouldSee(expectedTimeline: {author: string; text: string; publicationTime: string}[]){
            expect(timeline).toEqual(expectedTimeline);
        },
        messageRepository,
    }
}

export type MessagingFixture = ReturnType<typeof createMessagingFixture>;

