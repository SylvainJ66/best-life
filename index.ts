#!/usr/bin/env node
import { Command } from "commander"
import {DateProvider, PostMessageCommand, PostMessageUseCase} from "./src/post-message.usecase";
import {InMemoryMessageRepository} from "./src/tests/message.inmemory.repository";
import {FileSystemMessageRepository} from "./src/message.fs.repository";

class RealDateProvider implements DateProvider{
    getNow(): Date {
        return new Date()
    }

}
const messageRepository = new FileSystemMessageRepository()
const dateProvider = new RealDateProvider()
const postMessageUseCase = new PostMessageUseCase(messageRepository, dateProvider)

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
              id: "somme-message-id",
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

async function main(){
    await program.parseAsync()
}
main();