import {createMessagingFixture, MessagingFixture} from "./messaging.fixtures";
import {messageBuilder} from "./message.builder";

describe("Feature: editing a message", () => {
    let fixture: MessagingFixture;
    beforeEach(() => {
        fixture = createMessagingFixture();
    });
    describe('Rule: the edited text should not superior to 280 characters',  () => {
        test("Alice can edit her message to a text inferior to 280 characters", async ()=>{
            const aliceMessageBuilder = messageBuilder()
                .withId("message-id")
                .authoredBy("Alice")
                .withText("Hello Wrld");
            fixture.givenTheFollowingMessagesExist([
                aliceMessageBuilder.build()])
            await fixture.whenUserEditsMessage({
                messageId: "message-id",
                text: "Hello World",})
            fixture.thenMessageShouldBe(
                aliceMessageBuilder
                    .withText("Hello World")
                    .build())
        })
    }); 
});