import { IColumnDefinition } from "./column";


export type CTargetAwareSort = (columnDefinitions : IColumnDefinition[]) => IColumnDefinition[]

export type CIsOfType = (variable : unknown) => boolean

export type CIdentity = (variable : unknown) => unknown

export interface IStringKeysObject { [x:string] : any }