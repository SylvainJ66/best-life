import {
    EmptyMessageError, MessageTooLongError,
} from "../post-message.usecase";
import {createMessagingFixture, MessagingFixture} from "./messaging.fixtures";
import {messageBuilder} from "./message.builder";

describe("Feature: Posting a message", () => {
    let fixture: MessagingFixture;
    beforeEach(() => {
       fixture = createMessagingFixture()
    });
    describe("Rule: A message can contain a maximum of 280 caracters", () => {
        test("Alice can post a message on her timeline", async () => {
            fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"))
            await fixture.whenAUserPostAMessage({
                id: "message-id",
                text: "hello world",
                author: "Alice"
            })
            fixture.thenMessageShouldBe(
                messageBuilder()
                    .withId("message-id")
                    .withText("hello world")
                    .authoredBy("Alice")
                    .withPublishedAt(new Date("2023-01-19T19:00:00.000Z"))
                    .build());
        });
        test("Alice can not post a message with more than 280 characters", async () => {
            const textWithLenghtOf281 = "One morning, when Gregor Samsa woke from troubled dreams, " +
                "he found himself transformed in his bed into a horrible vermin. " +
                "He lay on his armour-like back, " +
                "and if he lifted his head a little he could see his brown belly, " +
                "slightly domed and divided by arches into stiff sections. The ";

            fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));
            await fixture.whenAUserPostAMessage({
                id: "message-id",
                text: textWithLenghtOf281,
                author: "Alice"
            });

            fixture.thenErrorShouldBe(MessageTooLongError);
        });
    });
    describe("Rule: A message can not be empty", () => {
        test("Alice can not post a message with an empty text", async () => {
            fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));
            await fixture.whenAUserPostAMessage({
                id: "message-id",
                text: "",
                author: "Alice"
            });
            fixture.thenErrorShouldBe(EmptyMessageError);
        });
        test("Alice can not post a message with only white spaces", async () => {
            fixture.givenNowIs(new Date("2023-01-19T19:00:00.000Z"));
            await fixture.whenAUserPostAMessage({
                id: "message-id",
                text: "    ",
                author: "Alice"
            });
            fixture.thenErrorShouldBe(EmptyMessageError);
        });
    });
});