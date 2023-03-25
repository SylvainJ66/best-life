import {InMemoryMessageRepository} from "./message.inmemory.repository";
import {ViewTimeLineUseCase} from "../view-timeline.usecase";
import {Message} from "../message";
import {StubDateProvider} from "./stub-date-provider";

describe("Feature: Viewing a personal timeline", () => {
    let fixture: Fixture;
    beforeEach(()=>{
        fixture = createFixture();
    })
    describe("Rule: Message are shown in reverse chronological order", ()=>{
        test("Alice can view the 3 messages she have published in her timeline", async () => {
            fixture.givenTheFollowingMessagesExist([{
                author: "Alice",
                text: "my first message",
                id: "message-1",
                publishedAt: new Date("2023-02-07T16:27:59.000Z")
            },{
                author: "Bob",
                text: "Hi it's Bob",
                id: "message-2",
                publishedAt: new Date("2023-02-07T16:29:00.000Z")
            },{
                author: "Alice",
                text: "how are you all",
                id: "message-3",
                publishedAt: new Date("2023-02-07T16:30:00.000Z")
            },{
                author: "Alice",
                text: "My last message",
                id: "message-4",
                publishedAt: new Date("2023-02-07T16:30:30.000Z")
            }])
            fixture.giveNowIs(new Date("2023-02-07T16:31:00.000Z"))
            await fixture.whenTheUserSeeTheTimeLineOf("Alice")
            fixture.thenUserShouldSee([{
                author: "Alice",
                text: "My last message",
                publicationTime: "less than 1 minute ago"
            },{
                author: "Alice",
                text: "how are you all",
                publicationTime: "1 minute ago"
            },{
                author: "Alice",
                text: "my first message",
                publicationTime: "3 minutes ago"
            }])
        });
    });
});

const createFixture = () => {
    let timeline: {author: string; text: string; publicationTime: string}[];
    const messageRepository = new InMemoryMessageRepository();
    const dateProvider = new StubDateProvider();
    const viewTimeLineUseCase = new ViewTimeLineUseCase(
        messageRepository, dateProvider);
    return {
        givenTheFollowingMessagesExist(messages: Message[]){
            messageRepository.givenExistingMessages(messages);
        },
        giveNowIs(now: Date){
            dateProvider.now = now;
        },
        async whenTheUserSeeTheTimeLineOf(user: string){
            timeline = await viewTimeLineUseCase.handle({ user });
        },
        thenUserShouldSee(expectedTimeline: {author: string; text: string; publicationTime: string}[]){
            expect(timeline).toEqual(expectedTimeline);
        },
    }
};
type Fixture = ReturnType<typeof createFixture>;
