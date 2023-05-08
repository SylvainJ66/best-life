import {
    PostgreSqlContainer,
    StartedPostgreSqlContainer
} from "testcontainers";
import {Prisma, PrismaClient} from "prisma/prisma-client/scripts/default-index";
import {promisify} from "util";
import {exec} from "child_process";

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
            = `postgres://bestlife-test:bestlife-test@
            ${container.getHost()}:${container.getMappedPort(5432)}
            /bestlife-test?schema=public`;
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
    test("bidon", () => {
       expect(true).toBe(false);
    });
})