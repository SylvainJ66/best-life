import * as path from "path"
import {FileSystemMessageRepository} from "../message.fs.repository";
import * as fs from "fs";
import {messageBuilder} from "../../tests/message.builder";

const testMessagePath = path.join(__dirname, "./message.test.JSON");
describe("FileSystemRepository", () => {
    beforeEach(async () => {
        await fs.promises.writeFile(testMessagePath, JSON.stringify([]));
    })
    test("save() can save a message in the filesystem", async () => {
        const messageRepository = new FileSystemMessageRepository(testMessagePath);
        await messageRepository.save(
            messageBuilder()
                .authoredBy("Alice")
                .withId("m1")
                .withPublishedAt(new Date("2023-02-16T14:54:00.000Z"))
                .withText("test message")
                .build()
        );
        const messagesData = await fs.promises.readFile(testMessagePath);
        const messageJSON = JSON.parse(messagesData.toString());
        expect(messageJSON).toEqual([{
            id: "m1",
            author: "Alice",
            publishedAt: "2023-02-16T14:54:00.000Z",
            text: "test message"
        }])
    })
    test("save() can update an existing message in the filesystem", async () => {
        const messageRepository = new FileSystemMessageRepository(testMessagePath);
        await fs.promises.writeFile(testMessagePath, JSON.stringify([{
            id: "m1",
            author: "Alice",
            publishedAt: "2023-02-16T14:54:00.000Z",
            text: "test message"
        }]));
        await messageRepository.save(
            messageBuilder()
                .authoredBy("Alice")
                .withId("m1")
                .withPublishedAt(new Date("2023-02-16T14:54:00.000Z"))
                .withText("test message edited")
                .build()
        );
        const messagesData = await fs.promises.readFile(testMessagePath);
        const messageJSON = JSON.parse(messagesData.toString());
        expect(messageJSON).toEqual([{
            id: "m1",
            author: "Alice",
            publishedAt: "2023-02-16T14:54:00.000Z",
            text: "test message edited"
        }])
    })
    test("getById return a message by his Id", async () => {
        const messageRepository = new FileSystemMessageRepository(testMessagePath);
        await fs.promises.writeFile(testMessagePath, JSON.stringify([{
            id: "m1",
            author: "Alice",
            publishedAt: "2023-02-16T14:54:00.000Z",
            text: "test message"
        },{
            id: "m2",
            author: "Bob",
            publishedAt: "2023-02-16T14:55:00.000Z",
            text: "Hello from Bob"
        }]));
        const bobMessage = await messageRepository.getById("m2");
        expect(bobMessage).toEqual(
            messageBuilder()
                .authoredBy("Bob")
                .withId("m2")
                .withText("Hello from Bob")
                .withPublishedAt(new Date("2023-02-16T14:55:00.000Z"))
                .build())
    });
    test("getAllOfUser return all messages from a specific user", async () => {
        const messageRepository = new FileSystemMessageRepository(testMessagePath);
        await fs.promises.writeFile(testMessagePath, JSON.stringify([{
            id: "m1",
            author: "Alice",
            publishedAt: "2023-02-16T14:54:00.000Z",
            text: "test message"
        },{
            id: "m2",
            author: "Bob",
            publishedAt: "2023-02-16T14:55:00.000Z",
            text: "Hello from Bob"
        },{
            id: "m3",
            author: "Alice",
            publishedAt: "2023-02-16T14:56:00.000Z",
            text: "Alice message 2"
        }]));
        const aliceMessages = await messageRepository.getAllOfUser("Alice");
        expect(aliceMessages).toHaveLength(2);
        expect(aliceMessages).toEqual(expect.arrayContaining([
            messageBuilder()
                .authoredBy("Alice")
                .withId("m1")
                .withText("test message")
                .withPublishedAt(new Date("2023-02-16T14:54:00.000Z"))
                .build(),
            messageBuilder()
                .authoredBy("Alice")
                .withId("m3")
                .withText("Alice message 2")
                .withPublishedAt(new Date("2023-02-16T14:56:00.000Z"))
                .build()]))
    });
})