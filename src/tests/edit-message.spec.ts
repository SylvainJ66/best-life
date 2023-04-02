import {createMessagingFixture, MessagingFixture} from "./messaging.fixtures";
import {messageBuilder} from "./message.builder";
import {EmptyMessageError, MessageTooLongError} from "../domain/message";

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
            await fixture.thenMessageShouldBe(
                aliceMessageBuilder
                    .withText("Hello World")
                    .build())
        })
        test('Alice cannot edit her message to a text superior to 280 characters', async () => {
            const textWithLenghtOf281 = "One morning, when Gregor Samsa woke from troubled dreams, " +
                "he found himself transformed in his bed into a horrible vermin. " +
                "He lay on his armour-like back, " +
                "and if he lifted his head a little he could see his brown belly, " +
                "slightly domed and divided by arches into stiff sections. The p";
            const originalAliceMessage = messageBuilder()
                .withId("message-id")
                .authoredBy("Alice")
                .withText("Hello World")
                .build();
            fixture.givenTheFollowingMessagesExist([
                originalAliceMessage])
            await fixture.whenUserEditsMessage({
                messageId: "message-id",
                text: textWithLenghtOf281,})
            await fixture.thenMessageShouldBe(originalAliceMessage);
            fixture.thenErrorShouldBe(MessageTooLongError);
        })
        test('Alice cannot edit her message to an empty text', async () => {
            const originalAliceMessage = messageBuilder()
                .withId("message-id")
                .authoredBy("Alice")
                .withText("Hello World")
                .build();
            fixture.givenTheFollowingMessagesExist([
                originalAliceMessage])
            await fixture.whenUserEditsMessage({
                messageId: "message-id",
                text: ""})
            await fixture.thenMessageShouldBe(originalAliceMessage);
            fixture.thenErrorShouldBe(EmptyMessageError);
        })
        test('Alice cannot edit her message to an white space text', async () => {
            const originalAliceMessage = messageBuilder()
                .withId("message-id")
                .authoredBy("Alice")
                .withText("Hello World")
                .build();
            fixture.givenTheFollowingMessagesExist([
                originalAliceMessage])
            await fixture.whenUserEditsMessage({
                messageId: "message-id",
                text: "   "})
            await fixture.thenMessageShouldBe(originalAliceMessage);
            fixture.thenErrorShouldBe(EmptyMessageError);
        })
    }); 
});