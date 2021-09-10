import { IncomingMessage, ServerResponse } from 'node:http';

// Interfaces

export interface IPayload {

  type: string;
  userId: string | number;
  lifetime: string | undefined;
}
export interface IUserPayload {
  type: string;
  id: string | number;
  lifetime: number;
}

export interface ITodoPayload {
  type: ETokenType;
  id: string;
  lifetime: number;
  iat: number;
  exp: number;
}

export interface IUser {
  userId: number;
  name: string;
  email: string;
  password: string;
  token: string;
  date: number;
  expiresIn: number;

}

export interface IRefreshedTokens {
  accessToken: string | Error;
  refreshToken: string | Error;
}

export interface ITodoItem {
  id: number;
  text: string;
  checked: ETodoStatus;
  userId: number;
}

export interface ITodoModel {
  getItemById(id: string): Promise<ITodoItem | Error>;
  getItems(accessToken: string): Promise<void | Error | Array<ITodoItem>>;
  createItem(
    title: string | undefined,
    accessToken: string,
  ): Promise<void | Error>;
  editElement(
    title: string | undefined,
    id: string | number,
  ): Promise<void | Error>;
  setCheck(
    checked: boolean | undefined,
    id: string | number,
  ): Promise<void | Error>;
  deleteElement(id: string | number): Promise<void | Error>;
}
export interface IUserModel {
  findUser(query: string): Promise<IUser | Error>;
  addUser(email: string, password: string): Promise<IUser | undefined | Error>;
  login(
    email: string,
    password: string,
  ): Promise<IRefreshedTokens | undefined | Error>;
  refreshTokens(
    refreshToken: string,
  ): Promise<IRefreshedTokens | undefined | Error>;
}

export interface IVerifyAccess {
  verify(
    req: IncomingMessage,
    res: ServerResponse,
    token: string,
  ): Promise<boolean | Error>;
}

export interface IDbResponse {
  affectedRows: number;
  insertId: number;
  warningStatus: number;
}

export interface ITodoBody {
  title?: string;
  checked?: boolean;
  id: string | number;
  token: string;
}

export interface IUserBody {
  email: string;
  password: string;
}

// Enums
export enum ETodoStatus {
  false = 0,
  true = 1,
}
export enum ETokenType {
  access = 'access',
  refresh = 'refresh',
}
