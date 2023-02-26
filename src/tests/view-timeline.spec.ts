import {InMemoryMessageRepository} from "./message.inmemory.repository";
import {ViewTimeLineUseCase} from "../view-timeline.usecase";
import {Message} from "../message";

describe("Feature: Viewing a personal timeline", () => {
    let fixture: Fixture;
    beforeEach(()=>{
        fixture = createFixture();
    })
    describe("Rule: Message are shown in reverse chronological order", ()=>{
        test("Alice can view the 2 messages she have published in her timeline", async () => {
            fixture.givenTheFollowingMessagesExist([{
                author: "Alice",
                text: "my first message",
                id: "message-1",
                publishedAt: new Date("2023-02-07T16:28:00.000Z")
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
            }])
            fixture.giveNowIs(new Date("2023-02-07T16:30:00.000Z"))
            await fixture.whenTheUserSeeTheTimeLineOf("Alice")
            fixture.thenUserShouldSee([{
                author: "Alice",
                text: "how are you all",
                publicationTime: "1 minute ago"
            },{
                author: "Alice",
                text: "my first message",
                publicationTime: "2 minutes ago"
            }])
        });
    });
});

const createFixture = () => {
    let timeline: {author: string; text: string; publicationTime: string}[];
    const messageRepository = new InMemoryMessageRepository();
    const viewTimeLineUseCase = new ViewTimeLineUseCase(messageRepository);
    return {
        givenTheFollowingMessagesExist(messages: Message[]){
            messageRepository.givenExistingMessages(messages);
        },
        giveNowIs(now: Date){},
        async whenTheUserSeeTheTimeLineOf(user: string){
            timeline = await viewTimeLineUseCase.handle({ user });
        },
        thenUserShouldSee(expectedTimeline: {author: string; text: string; publicationTime: string}[]){
            expect(timeline).toEqual(expectedTimeline);
        },
    }
};
type Fixture = ReturnType<typeof createFixture>;
