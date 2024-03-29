#!/usr/bin/env node
import {Command} from "commander"
import {PostMessageCommand, PostMessageUseCase} from "../application/usecases/post-message.usecase";
import {ViewTimeLineUseCase} from "../application/usecases/view-timeline.usecase";
import {EditMessageCommand, EditMessageUsecase} from "../application/usecases/edit-message.usecase";
import {RealDateProvider} from "../infra/realDateProvider";
import {FollowUserCommand, FollowUserUseCase} from "../application/usecases/follow-user-use.case";
import {ViewWallUseCase} from "../application/usecases/view-wall.usecase";
import {PrismaMessageRepository} from "../infra/message.prisma.repository";
import {PrismaFolloweeRepository} from "../infra/followee.prisma.repository";
import {PrismaClient} from "@prisma/client";
import {TimelinePresenter} from "./timeline.presenter";
import {Timeline} from "../domain/timeline";
import {DefaultTimelinePresenter} from "./defaultTimelinePresenter";

const prismaClient = new PrismaClient();
const messageRepository = new PrismaMessageRepository(prismaClient);
const followeeRepository = new PrismaFolloweeRepository(prismaClient);
const dateProvider = new RealDateProvider();
const defaultTimelinePresenter = new DefaultTimelinePresenter(dateProvider);
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider);
const viewTimeLineUseCase = new ViewTimeLineUseCase(messageRepository, dateProvider);
const viewWallUseCase = new ViewWallUseCase(messageRepository, followeeRepository);
const editMessageUseCase = new EditMessageUsecase(messageRepository);
const followUserUseCase = new FollowUserUseCase(followeeRepository);

export class CliTimelinePresenter implements TimelinePresenter{
    constructor(private readonly defaultTimelinePresenter: DefaultTimelinePresenter) {
    }
    show(timeline: Timeline): void {
        console.table(this.defaultTimelinePresenter.show(timeline));
    }
}

const timelinePresenter = new CliTimelinePresenter(defaultTimelinePresenter);
const program = new Command();
program
    .version("1.0.0")
    .description("crafty")
    .addCommand(
        new Command("post")
        .argument("<user>", "the current user")
        .argument("<message>", "the message to post")
        .action(async (user, message) => {
          const postMessageCommand: PostMessageCommand = {
              id: `${Math.floor(Math.random() * 10000)}`,
              text: message,
              author: user,
          }
          try {
            await postMessageUseCase.handle(postMessageCommand)
              console.log("👌 Message post")
          }catch (err){
              console.error("🤌,", err)
          }
        })
    )
    .addCommand(
        new Command("view")
            .argument("<user>", "the user to view the timeline of")
            .action(async (user) => {
                try{
                    const timeline = await viewTimeLineUseCase.handle({user}, timelinePresenter );
                    console.table(timeline)
                    process.exit(0)
                }catch(error){
                    console.error(error)
                    process.exit(1)
                }
            })
    )
    .addCommand(
        new Command("wall")
            .argument("<user>", "the user to view the wall of")
            .action(async (user) => {
                try{
                    const timeline = await viewWallUseCase.handle({user} , timelinePresenter);
                    console.table(timeline)
                    process.exit(0)
                }catch(error){
                    console.error(error)
                    process.exit(1)
                }
            })
    )
    .addCommand(
        new Command("edit")
            .argument("<message-id>", "the message id of the message to edit")
            .argument("<message>", "the new text")
            .action(async (messageId, message) => {
                const editMessageCommand: EditMessageCommand = {
                    messageId,
                    text: message
                }
                try {
                    await editMessageUseCase.handle(editMessageCommand)
                    console.log("👌 Message edité")
                }catch (err){
                    console.error("🤌,", err)
                }
            })
    )
    .addCommand(
        new Command("follow")
            .argument("<user>", "the current user")
            .argument("<user-to-follow>", "the user to follow")
            .action(async (user, userToFollow) => {
                const followUserCommand: FollowUserCommand = {
                    user,
                    userToFollow
                }
                try {
                    await followUserUseCase.handle(followUserCommand)
                    console.log(`😎 Tu suis maintenant ${userToFollow}`)
                }catch (err){
                    console.error("🤌,", err)
                }
            })
    )

async function main(){
    await prismaClient.$connect();
    await program.parseAsync()
    await prismaClient.$disconnect();
}
main();