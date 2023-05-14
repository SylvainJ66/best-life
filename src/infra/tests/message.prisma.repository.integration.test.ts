import {
    PostgreSqlContainer,
    StartedPostgreSqlContainer
} from "testcontainers";
//import {Prisma, PrismaClient} from "prisma/prisma-client/scripts/default-index";
import { PrismaClient } from '@prisma/client'

import {promisify} from "util";
import {exec} from "child_process";
import {PrismaMessageRepository} from "../message.prisma.repository";
import {messageBuilder} from "../../tests/message.builder";

const asyncExec = promisify(exec);

describe("PrismaMessageRepository", () => {
    let container: StartedPostgreSqlContainer;
    let prismaClient: PrismaClient;
    beforeAll(async () => {
        container = await new PostgreSqlContainer()
            .withDatabase("bestlife-test")
            .withUsername("bestlife-test")
            .withPassword("bestlife-test")
            .withExposedPorts(5432)
            .start();
        const databaseUrl
            = `postgresql://bestlife-test:bestlife-test@${container.getHost()}:${container.getMappedPort(5432)}/bestlife-test?schema=public`;
        prismaClient = new PrismaClient({
            datasources: {
                db:{
                    url: databaseUrl,
                },
            },
        });
        await asyncExec(`DATABASE_URL=${databaseUrl} npx prisma migrate deploy`)
        return prismaClient.$connect();
    });
    afterAll(async () => {
       await container.stop({ timeout: 1000 });
       return prismaClient.$disconnect();
    });
    beforeEach(async () => {
       await prismaClient.message.deleteMany();
       await prismaClient.$executeRawUnsafe('DELETE FROM "User" CASCADE');

    });
    test("save() should save a new message", async () => {
       const messageRepository = new PrismaMessageRepository(prismaClient);
       await messageRepository.save(
           messageBuilder()
           .authoredBy("Alice")
           .withId("message-id")
           .withText("Hello World!")
           .publishedAt(new Date("2023-02-09T15:50:00.000Z"))
           .build());
       const expectedMessage = await prismaClient.message.findUnique({
           where: { id: "message-id" }
       })
        expect(expectedMessage).toEqual({
            id: "message-id",
            authorId: "Alice",
            publishedAt: new Date("2023-02-09T15:50:00.000Z"),
            text: "Hello World!"
        });
    });
    test("save() should update an existing message", async () => {
        const messageRepository = new PrismaMessageRepository(prismaClient);
        const aliceMessageBuilder = messageBuilder()
            .authoredBy("Alice")
            .withId("message-id")
            .withText("Hello World!")
            .publishedAt(new Date("2023-02-09T15:50:00.000Z"))
        await messageRepository.save(aliceMessageBuilder.build());
        await messageRepository.save(aliceMessageBuilder.withText("Hello World 2").build());
        const expectedMessage = await prismaClient.message.findUnique({
            where: { id: "message-id" }
        })
        expect(expectedMessage).toEqual({
            id: "message-id",
            authorId: "Alice",
            publishedAt: new Date("2023-02-09T15:50:00.000Z"),
            text: "Hello World 2"
        });
    });
    test("getById() should return a message by its id", async () => {
        const messageRepository = new PrismaMessageRepository(prismaClient);
        const aliceMessage = messageBuilder()
            .authoredBy("Alice")
            .withId("message-id")
            .withText("Hello World!")
            .publishedAt(new Date("2023-02-09T15:50:00.000Z"))
            .build();
        await messageRepository.save(aliceMessage);
        const retrievedMessage = await messageRepository.getById("message-id");
        expect(retrievedMessage).toEqual(aliceMessage);
    });
    test("getAllOfUser() should return all user messages", async () => {
        const messageRepository = new PrismaMessageRepository(prismaClient);
        await Promise.all([
            messageRepository.save(messageBuilder()
                .authoredBy("Alice")
                .withId("message-id")
                .withText("Hello World!")
                .publishedAt(new Date("2023-02-09T15:50:00.000Z"))
                .build()),
            messageRepository.save(messageBuilder()
                .authoredBy("Bob")
                .withId("message-id2")
                .withText("Hi from Bob")
                .publishedAt(new Date("2023-02-09T15:52:00.000Z"))
                .build()),
            messageRepository.save(messageBuilder()
                .authoredBy("Alice")
                .withId("message-id3")
                .withText("Second message")
                .publishedAt(new Date("2023-02-09T15:55:00.000Z"))
                .build())])
        const aliceMessages = await messageRepository.getAllOfUser("Alice");
        expect(aliceMessages).toHaveLength(2);
        expect(aliceMessages).toEqual(expect.arrayContaining([
            messageBuilder()
                .authoredBy("Alice")
                .withId("message-id")
                .withText("Hello World!")
                .publishedAt(new Date("2023-02-09T15:50:00.000Z"))
                .build(),
            messageBuilder()
                .authoredBy("Alice")
                .withId("message-id")
                .withText("Hello World!")
                .publishedAt(new Date("2023-02-09T15:50:00.000Z"))
                .build()
        ]))
    })
})