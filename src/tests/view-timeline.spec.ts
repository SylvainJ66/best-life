import {createMessagingFixture, MessagingFixture} from "./messaging.fixtures";
import {messageBuilder} from "./message.builder";

describe("Feature: Viewing a personal timeline", () => {
    let fixture: MessagingFixture;
    beforeEach(()=>{
        fixture = createMessagingFixture();
    })
    describe("Rule: Message are shown in reverse chronological order", ()=>{
        test("Alice can view the 3 messages she have published in her timeline", async () => {
            const aliceMessageBuilder = messageBuilder().authoredBy("Alice");
            fixture.givenTheFollowingMessagesExist([
                aliceMessageBuilder
                    .withId("message-1")
                    .withText("my first message")
                    .withPublishedAt(new Date("2023-02-07T16:27:59.000Z"))
                    .build(),
                messageBuilder()
                    .authoredBy("Alice")
                    .withId("message-2")
                    .withText("Hi it's Bob")
                    .withPublishedAt(new Date("2023-02-07T16:29:00.000Z"))
                    .build(),
                aliceMessageBuilder
                    .withId("message-3")
                    .withText("how are you all")
                    .withPublishedAt(new Date("2023-02-07T16:30:00.000Z"))
                    .build(),
                aliceMessageBuilder
                    .withId("message-4")
                    .withText("My last message")
                    .withPublishedAt(new Date("2023-02-07T16:30:30.000Z"))
                    .build()
            ])
            fixture.givenNowIs(new Date("2023-02-07T16:31:00.000Z"))
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
