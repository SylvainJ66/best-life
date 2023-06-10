import Fastify, {FastifyInstance} from "fastify";
import * as httpErrors from "http-errors";
import {PostMessageCommand, PostMessageUseCase} from "../application/usecases/post-message.usecase";
import {ViewTimeLineUseCase} from "../application/usecases/view-timeline.usecase";
import {EditMessageCommand, EditMessageUsecase} from "../application/usecases/edit-message.usecase";
import {RealDateProvider} from "../infra/realDateProvider";
import {FollowUserCommand, FollowUserUseCase} from "../application/usecases/follow-user-use.case";
import {ViewWallUseCase} from "../application/usecases/view-wall.usecase";
import {PrismaMessageRepository} from "../infra/message.prisma.repository";
import {PrismaFolloweeRepository} from "../infra/followee.prisma.repository";
import {PrismaClient} from "@prisma/client";

const prismaClient = new PrismaClient();
const messageRepository = new PrismaMessageRepository(prismaClient);
const followeeRepository = new PrismaFolloweeRepository(prismaClient);
const dateProvider = new RealDateProvider();
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
const viewTimeLineUseCase = new ViewTimeLineUseCase(messageRepository, dateProvider);
const viewWallUseCase = new ViewWallUseCase(messageRepository, followeeRepository, dateProvider);
const editMessageUseCase = new EditMessageUsecase(messageRepository);
const followUserUseCase = new FollowUserUseCase(followeeRepository);

const fastify = Fastify({ logger: true })
const routes = async (fastifyInstance: FastifyInstance) => {
    fastifyInstance.post<{ Body:{ user: string; message: string } }>(
        "/post", {},
        async (request, reply) => {
            const postMessageCommand: PostMessageCommand = {
                id: `${Math.floor(Math.random() * 10000)}`,
                text: request.body.message,
                author: request.body.user,
            }
            try {
                await postMessageUseCase.handle(postMessageCommand)
                reply.status(201)
            }catch (err){
                reply.send(httpErrors[500](err))
            }
        });

    fastifyInstance.post<{ Body:{messageId: string; message: string } }>(
        "/edit", {},
        async (
            request,
            reply) => {
            const editMessageCommand: EditMessageCommand = {
                messageId: request.body.messageId,
                text: request.body.message,
            }
            try {
                await editMessageUseCase.handle(editMessageCommand)
                reply.status(201)
            }catch (err){
                reply.send(httpErrors[500](err))
            }
        });

    fastifyInstance.post<{ Body:{user: string; followee: string } }>(
        "/follow", {},
        async (
            request,
            reply) => {
            const followUserCommand: FollowUserCommand = {
                user: request.body.user,
                userToFollow: request.body.followee,
            }
            try {
                await followUserUseCase.handle(followUserCommand)
                reply.status(201)
            }catch (err){
                reply.send(httpErrors[500](err))
            }
        });

    fastifyInstance.get<{
        Querystring: { user: string };
        Reply:
            | { author: string; text: string; publicationTime: string }[]
            | httpErrors.HttpError<500>;
    }>("/view", {},async (request, reply) => {

            try {
                const timeline = await viewTimeLineUseCase.handle({
                    user: request.query.user
                })
                reply.status(200).send(timeline)
            }catch (err){
                reply.send(httpErrors[500](err))
            }
        });

    fastifyInstance.get<{
        Querystring: { user: string };
        Reply:
            | { author: string; text: string; publicationTime: string }[]
            | httpErrors.HttpError<500>
    }>("/wall",
        {},
        async (
            request,
            reply) => {

            try {
                const wall = await viewWallUseCase.handle({
                    user: request.query.user
                })
                reply.status(200).send(wall)
            }catch (err){
                reply.send(httpErrors[500](err))
            }
        });
}
fastify.register(routes);
fastify.addHook("onClose", async () => {
    await prismaClient.$disconnect();
});
async function main(){
    try{
        await prismaClient.$connect();
        await fastify.listen({ port: 3000 })
    }catch(err){
        fastify.log.error(err)
        process.exit(1);
    }
}
main();