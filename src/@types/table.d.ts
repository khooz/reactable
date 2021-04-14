import * as React from "react";
import { IStringKeysObject } from "./helpers";

export type COnRowClickHandler = (event : React.MouseEvent, column : any, row : object | any[], table : (object | any[])[]) => void

export interface ITableProps {
	searchable : boolean
	, clickable : boolean
	, pageable : boolean
	, resource : string
	, className : string
	, style : CSSStyleDeclaration
	, columns : any[]
	, pageSizes : number[]
	, loadingBar: React.RefObject<any>
	, axios : any
	, onRowClick : COnRowClickHandler
	, children : (string | HTMLElement | React.ReactNode)[]
	[props: string]: any 
}

export interface IFetchRequest {
	resource ?: string
	, query ?: IStringKeysObject
	, page ?: number
}

interface ISelectOption {
	value: any
	label: any
}

export interface IHALResponse {
	page : any
	, _links: any
	, _embedded: any
}