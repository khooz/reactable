export enum EColumnScope {
	ROW = "row"
	, COLUMN = "column"
}

export enum ERenderType {
	DISPLAY = "display"
	, SEARCH = "search"
	, ORDER = "order"
}

export interface IColumnTarget {

}

export interface IColumnSorting {
	priority ?: number
	order ?: "asc" | "desc"
}



export interface IColumnDefinition {
	title ?: string
	, name ?: string
	, scope ?: EColumnScope
	, target ?: number | number[]
	, sort ?: string | IColumnSorting
	, className ?: string
	, render ?: (column: any, row: any, type : ERenderType) => any
}

export type COnRowClickHandler = (event : React.MouseEvent, column : any) => void

export interface IColumn {
	data ?: any
	, column ?: IColumnDefinition
	, onClick ?: COnRowClickHandler
	, children ?: any
	, [props : string] : any
}

