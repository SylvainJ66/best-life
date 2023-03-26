export type Message = {id: string; text: string; author: string; publishedAt: Date};

export class MessageText{
    private constructor(readonly value: string) {

    }
    static of(text: string){
        if(text.length > 280){
            
        }
    }
}