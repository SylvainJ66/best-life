import * as path from "path";
import * as fs from "fs";
import {Message} from "./message";
import {MessageRepository} from "./message.repository";

export class FileSystemMessageRepository implements MessageRepository{
    save(message: Message): Promise<void> {
        return fs.promises.writeFile(
            path.join(__dirname, 'message.json'),
            JSON.stringify(message));
    }

    getAllOfUser(user: string): Promise<Message[]> {
        return Promise.resolve([]);
    }

}