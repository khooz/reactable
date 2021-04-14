import {
	isEmpty,
	isString,
} from 'lodash';
import * as React from 'react';
import {
	Button
	, Col
	, FormGroup, Input
	, InputGroup, InputGroupAddon, Label, Row
	, Table as ReactTable
} from 'reactstrap';
import CreatableSelect from 'react-select/creatable';
import TableRow from "./TableRow";
import QueryString from "qs";
import Axios from 'axios';
import { ERenderType, IColumnDefinition, IColumnSorting, IFetchRequest, IHALResponse, ISelectOption, IStringKeysObject, ITableProps } from "./@types/index";
import { IdentityFunction, targetAwareSort } from './helpers';
import { isIColumnSorting } from './TableCol';

const defaultITableProps : ITableProps = {
	searchable: false
	, clickable: false
	, pageable: false
	, resource: null
	, className: ""
	, style: {} as CSSStyleDeclaration
	, columns: []
	, pageSizes: [ 5, 10, 25, 50]
	, loadingBar: React.useRef<React.Component>(null)
	, axios: null
	, onRowClick: (event : React.MouseEvent, column : any, row : object | any[], table : (object | any[])[]) => {}
	, children: null
}

const Table = ({
	searchable = false
	, clickable = false
	, pageable = false
	, resource = null
	, className = ""
	, style = {} as CSSStyleDeclaration
	, columns = []
	, pageSizes = [ 5, 10, 25, 50]
	, loadingBar = React.useRef<React.Component>(null)
	, axios = null
	, onRowClick = (event : React.MouseEvent, column : any, row : object | any[], table : (object | any[])[]) => {}
	, children = null as (HTMLElement | React.ReactNode)[]
	, ...props
} : ITableProps) => {
	
	const [ resourceData, updateResourceData ] = React.useState<IHALResponse | (HTMLElement | React.ReactNode)[]>(null);
	const [ resourceState, updateResourceState ] = React.useState([]);
	const [ targetAwareColumns , updateTargetAwareColumns ] = React.useState<IColumnDefinition[]>([]);
	const [ rowsState, updateRowsState ] = React.useState([]);
	const [ seacrhField, updateSeacrhField ] = React.useState(null);
	const [ pageSizeField, updatePageSizeField ] = React.useState<number>(10);
	const [ currentPage, updateCurrentPage ] = React.useState<number>(0);

	
	let renderHeader = () : JSX.Element[] => {
		return targetAwareColumns?.map((o : IColumnDefinition) => o?.title ?? "")?.map((i : string , x : number) => (<td key={x}>{i}</td>)); //
	}
	
	let renderBody = React.useCallback((d) => {
		return d?.map((i : any, x: number) => {
			return (
				<TableRow
					key={ x }
					columns={ targetAwareColumns }
					onClick={ (e, c = undefined, r = undefined) => onRowClick(e, c, r, d) }
					clickable={ clickable }
				>
					{ i }
				</TableRow>
			);
		});
	}, []);

	let onPageClick = async (e : React.MouseEvent, p = 0, d = false) => {
		e.preventDefault();
		if (!d)
		{
			const response = await fetchResource({
				resource: resource
				, page: p
				, query: tokenize(seacrhField)?.[1] ?? {}
			});
			updateResourceData(response?.data);
			updateResourceState(sanitize(response?.data));
			updateCurrentPage(p);
		}
	};

	let renderPagination = (page_data : { totalPages ?: number } = null) => {
		const PageLink = ({
			disabled = false
			, page = 0
			, href = ""
			, ...properties
		}) => {
			return (
				<a href={ href } onClick={ e => disabled ? e.preventDefault() : onPageClick(e, page, disabled) }>
					<div style={{
						padding: "5px",
						display: "inline-block"
					}}>
						{ properties?.text }
					</div>
				</a>
			);
		}
		if (page_data)
		{
			let total_pages = (page_data?.totalPages ?? 0);
			let pageLinks = [];
			let start_point = currentPage - 2 > -1 ? currentPage - 2 : currentPage - 1 > -1 ? currentPage - 1 : currentPage;  
			let end_point = currentPage + 2 < total_pages ? currentPage + 2 : currentPage + 1 < total_pages ? currentPage + 1 : currentPage;
			let j = 0;
			if (total_pages > 3)
			{
				if (currentPage > 1)
				{
					pageLinks.push(<PageLink key={ j++ } text={ "<<" } page={ 0 } href="" />);
				}
				if (total_pages > 1)
				{
					if (currentPage > 0)
					{
						pageLinks.push(<PageLink key={ j++ } text={ "<" } page={ currentPage > 0 ? currentPage - 1 : 0 } href="" />);
					}
					for (let i = start_point; i <= end_point; i++)
					{
						if (i === currentPage)
						{
							pageLinks.push(<PageLink key={ j++ } text={ i + 1 } page={ i } href="" disabled />);
						}
						else
						{
							pageLinks.push(<PageLink key={ j++ } text={ i + 1 } page={ i } href="" />);
						}
					}
					if (currentPage < total_pages - 1)
					{
						pageLinks.push(<PageLink key={ j++ } text={ ">" } page={ currentPage + 1 } href="" />);
					}
				}
				else
				{
					for (let i = start_point; i <= end_point; i++)
					{
						if (i === currentPage)
						{
							pageLinks.push(<PageLink key={ j++ } text={ i + 1 } page={ i } href="" disabled />);
						}
						else
						{
							pageLinks.push(<PageLink  key={ j++ } text={ i + 1 } page={ i } href="" />);
						}
					}
				}
				if (currentPage < total_pages - 2)
				{
					pageLinks.push(<PageLink key={ j } text={ ">>" } page={ total_pages - 1 } href="" />);
				}
			}
			else
			{
				for (let i = start_point; i <= end_point; i++)
				{
					if (i === currentPage)
					{
						pageLinks.push(<PageLink key={ j++ } text={ i + 1 } page={ i } href="" disabled />);
					}
					else
					{
						pageLinks.push(<PageLink key={ j++ } text={ i + 1 } page={ i } href="" />);
					}
				}
			}
			
			
			return pageLinks;
		}
		return;
	}

	let renderTable = (d : any[]) => {
		let table;
		let src = Array.isArray(d) ? d[0] : d;
		if (React.isValidElement(src))
		{
			table = d
		}
		else
		{
			table = (
				<ReactTable className={ className + " table" } style={ { tableLayout: "auto", ...style } } { ...props }>
					<thead className="thead-light">
						<tr>
						{ renderHeader() }
						</tr>
					</thead>
					<tbody>
						{ rowsState.length > 0 ? rowsState : 
							<tr><td colSpan={ Array.isArray(columns) ? columns.length : 1 } className="text-center">No Data</td></tr>
						}
					</tbody>
				</ReactTable>
			);
		}
		return table;
	};
	
	let sortOrdering = React.useCallback(() : string[] => {
		return columns?.filter((a, idx) => {
			return 'sort' in a;
		})
		?.sort((a, b) => {
			let srta = a?.sort;
			let srtb = b?.sort;
			let srta_pri : number = undefined, srtb_pri : number = undefined;
			if (Number.isFinite(srta))
			{
				srta_pri = srta as number;
			}
			else if ("priority" in (srta as IColumnSorting))
			{
				srta_pri = (srta as IColumnSorting).priority;
			}
			if (Number.isFinite(srtb))
			{
				srtb_pri = srtb as number;
			}
			else if ("priority" in (srtb as IColumnSorting))
			{
				srtb_pri = (srtb as IColumnSorting).priority;
			}
			if (srta && srta_pri !== undefined)
			{
				if (srtb && srtb_pri !== undefined)
				{
					return srta_pri - srtb_pri;
				}
				return -1;
			}
			if (srtb_pri)
			{
				return 1;
			}
			return 0;
		})
		?.reduce((prev, cur, idx, a) => {
			let col = cur?.name?.split(".")?.[0];
			if ('sort' in cur)
			{
				if(isIColumnSorting(cur.sort))
				{
					col = `${col},${(cur.sort as IColumnSorting)?.order ?? 'asc'}`;
				}
				else if (typeof cur.sort === "string")
				{
					col = `${col},${cur.sort}`;
				}
				else
				{
					col = `${col},asc`;
				}
				prev.push(col);
			}
			return prev;
		}, []);
	}, [ columns ]);

	let mapSearchQuery = (query : IStringKeysObject) => {
		let result = {} as IStringKeysObject;
		let cols = targetAwareColumns;
		for (let key in query)
		{
			let col = cols.find( (obj, idx) => {
				return (
					key.toLowerCase() === obj?.name?.toLowerCase()
					|| key.toLowerCase() === obj?.title?.toLowerCase()
					|| idx === parseInt(key, 10)
				);
			});
			if (col && col?.name)
			{
				result[col.name] = query[key];
			}
		}
		return result;
	};

	let fetchResource = React.useCallback(async ({
		resource: resource_name
		, query = {}
		, page = 0,
	} : IFetchRequest ) => {
		if (axios)
		{
			try
			{
				let sortOrder = sortOrdering();
				let params = new URLSearchParams();
				query = mapSearchQuery(query);
				for (let key in query)
				{
					params.append(key, query[key]);
				}
				if (pageable)
				{
					params.append('page', page.toString());
					params.append('size', pageSizeField.toString());
				}
				sortOrder.forEach((itm, idx) => {
					params.append('sort', itm);
				});
				const response = await axios.request({
					method: 'get',
					url: isEmpty(query) ? `/${resource_name}` : `/${resource_name}/search/omni`,
					params: params
				});
				return response;
			}
			catch(error)
			{
				console.log(error);
			}
			return null;
		}
	}, [ axios, pageSizeField, columns, pageable ]);

	let searchResourceOmni = React.useCallback(async ({
		resource: resource_name
		, query
		, page = 0
	} : IFetchRequest) => {
		let sortOrder = sortOrdering();
		if (axios)
		{
			try
			{
				let params = new URLSearchParams();
				query = mapSearchQuery(query);
				for (let key in query)
				{
					params.append(key, query[key]);
				}
				if (pageable)
				{
					params.append('page', page.toString());
					params.append('size', pageSizeField.toString());
				}
				sortOrder.forEach((itm, idx) => {
					params.append('sort', itm);
				});
				const response = await axios.request({
					method: 'get',
					url: `/${resource_name}/search/omni`,
					params: params
				});
				return response;
			}
			catch(error)
			{
				console.log(error);
			}
		}
	}, [ axios, pageSizeField, columns, pageable ]);
	
	let sanitize = React.useCallback((data) => {
		return data?._embedded?.hasOwnProperty(resource ?? "") ?? false ? data?._embedded[resource] : data
	}, [ resource ]);

	const loadTable = React.useCallback(async () => {
		if (!children)
		{
			const response = await fetchResource({
				resource
			});
			if (!response)
			{
				return;
			}
			updateResourceData(response?.data);
			updateResourceState(sanitize(response?.data));
			updateCurrentPage(0);
		}
		else
		{
			updateResourceData(children);
			updateResourceState(children);
		}
	}, [children, fetchResource, resource, sanitize]);

	React.useEffect(() => {
		updateTargetAwareColumns(targetAwareSort(columns))
	}, [ columns ]);

	React.useEffect(() => {
		loadTable();
	}, [ loadTable ]);

	React.useEffect(() => {
		updateRowsState(Array.isArray(resourceState) && resourceState.length > 0 ? renderBody(resourceState) : []);
	}, [ columns, resourceState, renderBody ]);

	let tokenize = (s : string) => {
		let query = QueryString.parse(s, { ignoreQueryPrefix: true, strictNullHandling: true });
		let result = [ [], {}, query ]
		for (let key in query)
		{
			let value = query[key];
			if (value === null)
			{
				result[0].push(key);
			}
			else
			{
				result[1][key] = value;
			}
		}
		return result;
	};

	let searchLocal = (d : any[], t : string) => {
		let [ , , query ] = tokenize(t);
		let result = d;
		for (let key in query)
		{
			let value = query[key];
			result = result?.filter?.((i : any) => {
				return targetAwareColumns.reduce((prev, cur, idx) => {
					let rawContent : any;
					let column = isString(cur) ? cur as string : (cur?.name) ? cur?.name : idx;
					rawContent = i?.[column] ?? "INVALID_PATH";
					let colSplit = (""+column).split(".");
					if (colSplit.length > 1)
					{
						rawContent = i;
						while(colSplit.length > 0)
						{
							let tmp = colSplit.shift();
							rawContent = rawContent?.[tmp] ?? "INVALID_PATH";
							if (rawContent === "INVALID_PATH")
							{
								break;
							}
						}
					}
					let contentStr = (""+(cur?.render ? cur?.render(rawContent, i, ERenderType.SEARCH) : rawContent)).trim();
					if (value === null)
					{
						if (contentStr.toLowerCase().includes((""+key).toLowerCase().trim()))
						{
							return true;
						}
						return prev;
					}
					if (key === 'regex' && value !== null)
					{
						let parser = /^\/(?<regex>.*?)\/(?<flags>.*?)$/gm;
						value = (""+value ?? "").replace('\\&', '&').replace('\\\\', '\\');
						const parsed = parser.exec(value);
						if (!value)
						{
							return true;
						}
						try
						{
							parser = new RegExp(parsed?.groups?.regex ?? "", parsed?.groups?.flags);
							if (parser.test(contentStr))
							{
								return true;
							}
						}
						catch(e)
						{
							return prev;
						}
					}
					if (
						(
							key
							&& (
								key.toLowerCase() === cur?.name?.toLowerCase()
								|| key.toLowerCase() === cur?.title?.toLowerCase()
								|| idx === parseInt(key, 10)
							)
						)
						&& (
							value === null
							|| contentStr.toLowerCase().includes((""+value).toLowerCase().trim())
						)
					)
					{
						return true;
					}
					return prev;
				}, false);
			});
		}
		return result;
	};

	let searchFieldChange = (e : React.ChangeEvent<HTMLInputElement>) => {
		updateSeacrhField(e.target.value);
		let q = searchLocal(resourceState, e.target.value);
		updateRowsState(Array.isArray(q) && q.length > 0 ? renderBody(q) : []);
	};

	let searchRemote = async (e : React.MouseEvent) => {
		e.preventDefault();
		const [ , omni ] = tokenize(seacrhField);
		let response = await searchResourceOmni({
			resource
			, query: omni
		});
		updateResourceData(response?.data);
		updateResourceState(sanitize(response?.data));
		updateCurrentPage(0);
	};

	let transform2options = (obj_array : any[], formatter = IdentityFunction, id = "id", name = "name") : ISelectOption[] => {
		if (Array.isArray(obj_array))
		{
			try{
				return obj_array.map(itm => {
					if (typeof itm === typeof {})
					{
						return {
							value: itm?.[id] ?? undefined,
							label: formatter(itm?.[name] ?? undefined)
						}
					}
					else if (Array.isArray(itm))
					{
						return {
							value: itm?.[0] ?? undefined,
							label: formatter(itm?.[1] ?? undefined)
						}
					}
					else
					{
						return {
							value: itm,
							label: formatter(itm)
						}
					}
				});
			}
			catch (e) {
				console.log(e, obj_array)
				return null;
			}
			
		}
		return null;
	};

	return (
		<>
			{ (searchable === true || pageable === true) && 
				<Row className="justify-content-between">
					{ searchable === true &&
						<Col className="float-left" xl="4" lg="4" md="6" sm="6" xs="12">
							<FormGroup>
								<InputGroup>
									<Input
										type="text"
										placeholder="Search"
										onChange={ searchFieldChange }
										value={ seacrhField ?? "" }
									/>
									<InputGroupAddon addonType="append">
										<Button
											onClick={ async (e : React.MouseEvent) => await searchRemote(e) }
										><i className="fas fa-search"></i></Button>	
									</InputGroupAddon>
								</InputGroup>
							</FormGroup>
						</Col>
					}
					{ pageable === true &&
						<Col className="float-right" xl="4" lg="4" md="6" sm="6" xs="12">
							<FormGroup>
								<Row>
									<Col>
										<Label for={ `${resource}_page_size` } className="float-right contro-label">Page Size: </Label>
									</Col>
									<Col>
										<CreatableSelect
											id={ `${resource}_page_size` }
											onChange={ (a : any, e : any) => updatePageSizeField(a?.value) }
											styles={ {
												position: 'relative',
												top: '-2px'
											} }
											value={ {
												value: pageSizeField ?? pageSizes?.[1] ?? 10
												, label: pageSizeField ?? pageSizes?.[1] ?? 10
											} }
											options={ transform2options(pageSizes) }
										/>
									</Col>
								</Row>
							</FormGroup>
						</Col>
					}
				</Row>
			}
			{ renderTable(resourceState) }
			{ pageable === true && 
				<Row className="d-flex justify-content-center">
					<Col className="d-flex justify-content-center">
						{ renderPagination((resourceData as IHALResponse)?.page) }
					</Col>
				</Row>
			}
		</>
	);
};

export default Table;