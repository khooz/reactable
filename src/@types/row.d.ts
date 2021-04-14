import { IColumnDefinition } from "./column";

export type COnRowClickHandler = (event : React.MouseEvent, column : any, row : object | any[]) => void


export interface IRow {
	clickable ?: boolean
	, onClick ?: COnRowClickHandler
	, children ?: any
	, columns ?: IColumnDefinition[]
	, [props : string] : any
}