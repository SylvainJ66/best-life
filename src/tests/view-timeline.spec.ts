import {InMemoryMessageRepository} from "./message.inmemory.repository";
import {ViewTimeLineUseCase} from "../view-timeline.usecase";
import {Message} from "../message";

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
            },{
                author: "Alice",
                text: "My last message",
                id: "message-4",
                publishedAt: new Date("2023-02-07T16:50:00.000Z")
            }])
            fixture.giveNowIs(new Date("2023-02-07T16:30:00.000Z"))
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
                publicationTime: "2 minutes ago"
            }])
        });
    });
    const publicationTime = (now: Date, publishedAt: Date) => {
        const diff = now.getTime() - publishedAt.getTime();
        const minute = diff / 60000;
        if(diff >= 120000){
            return `${minute} minutes ago`
        }
        if(diff >= 60000){
            return "1 minute ago"
        }
        return "less than 1 minute ago"
    }
    describe('PublicationTime',  () => {
        it("should return 'less than 1 minute ago' when the publication time is" +
            "inferior to one minute ago", () => {
            const now = new Date('2023-02-07T10:57:00.000Z')
            const publishedAt = new Date('2023-02-07T10:56:30.000Z')
            const text = publicationTime(now, publishedAt);
            expect(text).toEqual("less than 1 minute ago");
        })
        it("should return '1 minute ago' when the publication date exactly" +
            "1 minute ago", () => {
            const now = new Date('2023-02-07T10:57:00.000Z')
            const publishedAt = new Date('2023-02-07T10:56:00.000Z')
            const text = publicationTime(now, publishedAt);
            expect(text).toEqual("1 minute ago");
        })
        it("should return '1 minute ago' when the publication date exactly" +
            "2 minutes ago", () => {
            const now = new Date('2023-02-07T10:57:00.000Z')
            const publishedAt = new Date('2023-02-07T10:55:01.000Z')
            const text = publicationTime(now, publishedAt);
            expect(text).toEqual("1 minute ago");
        })
        it("should return 'X minute ago' when the publication date exactly" +
            " 2 minutes ago", () => {
            const now = new Date('2023-02-07T10:57:00.000Z')
            const publishedAt = new Date('2023-02-07T10:55:00.000Z')
            const text = publicationTime(now, publishedAt);
            expect(text).toEqual("2 minutes ago");
        })
        it("should return '5 minute ago' when the publication date exactly" +
            " 5 minutes ago", () => {
            const now = new Date('2023-02-07T10:57:00.000Z')
            const publishedAt = new Date('2023-02-07T10:52:00.000Z')
            const text = publicationTime(now, publishedAt);
            expect(text).toEqual("5 minutes ago");
        })
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
