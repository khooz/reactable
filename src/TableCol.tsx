import * as React from "react";

import { IColumn, IColumnDefinition, IColumnSorting } from "./@types/column";
import { CIsOfType } from "./@types/helpers";

export const isIColumnSorting : CIsOfType = (variable : unknown): variable is IColumnSorting  => {
    return ("order" in (variable as IColumnSorting)) || ("priority" in (variable as IColumnSorting));
}

const TableCol = ({
	data = null
	, column = {}
	, onClick = (e : React.MouseEvent, c : any) => {}
	, children = null
	, ...props
} : IColumn) => {

	if (column?.scope)
	{
		return (
			<th
				scope={column.scope}
				className={ column?.className }
				onClick={ (e : React.MouseEvent) => onClick(e, data) }
				{ ...props }
			>
			{ children }
			</th>
		);
	}
	else
	{
		return (
			<td
				className={ column?.className }
				onClick={ (e : React.MouseEvent) => onClick(e, data) }
				{ ...props }
			>
				{ children }
			</td>
		);
	}
};

export default TableCol;