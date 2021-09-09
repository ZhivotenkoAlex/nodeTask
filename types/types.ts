import { IncomingMessage, ServerResponse } from "node:http";

export interface IPayload {
  type: String,
  userId: String | Number,
  lifetime: String|undefined
}

export enum ETokenType {
  access = "access",
  refresh="refresh"
}

export interface ITodoPayload{
  type: ETokenType,
  id: Number|String,
  lifetime: Number,
  iat: Number,
  exp: Number
}



export interface IUser{
  userId: Number,
    name: String,
    email: String,
    password: String,
    token: String,
    date: Number,
    expiresIn: Number
}

export interface IRefreshedTokens{
    accessToken: String|Error,
    refreshToken:String|Error
}

export enum ETodoStatus {
  false = 0,
  true=1
}

export interface ITodoItem {
  id: Number,
  text: String,
  checked:ETodoStatus,
userId: Number
 }

export interface ITodoModel{
    getItemById(id: String): Promise<{} | void>,
    getItems(accessToken: String): Promise<void|Error|Array<ITodoItem>>,
    createItem(title:String, accessToken:String):Promise<void|Error>,
    editElement(title:String, id:String|Number):Promise<void|Error>,
    setCheck(checked:Boolean, id:String|Number):Promise<void|Error>,
    deleteElement(id:String|Number):Promise<void|Error>  
}
export interface IVerifyAccess{
     verify(req:IncomingMessage, res:ServerResponse, token:String):Promise<Boolean|Error>
}

