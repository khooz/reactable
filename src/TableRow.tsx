import * as React from "react";
import { ERenderType, IColumnDefinition } from "./@types/column";
import { IRow } from "./@types/row";
import TD from "./TableCol";

const TR = ({
	clickable = false
	, onClick = (e : React.MouseEvent, c, r) => {}
	, children = {}
	, columns = []
	, ...props
} : IRow) => {

	const [ cols, updateCols ] = React.useState<React.ReactNode[]>([]);

	let renderCols = React.useCallback((co : IColumnDefinition[], d : any[]) => {
		let tmp;
		let src = Array.isArray(d) ? d[0] : d;
		if (React.isValidElement(src))
		{
			tmp = d
		}
		else
		{
			tmp = co.map((i : any, x : number) => {
				let rawContent : any;
				let column = typeof i === 'string' ? i : (i?.name) ? i?.name : x;
				rawContent = d?.[column] ?? "INVALID_PATH";
				let colSplit = (""+column).split(".");
				if (colSplit.length > 1)
				{
					rawContent = d;
					while(colSplit.length > 0)
					{
						let q = colSplit.shift();
						rawContent = rawContent?.[q] ?? "INVALID_PATH";
						if (rawContent === "INVALID_PATH")
						{
							break;
						}
					}
				}
				let contentStr = (i?.render ? i?.render(rawContent, d, ERenderType.DISPLAY) : rawContent);
				return (
					<TD
						key={ x }
						data={ rawContent }
						column={ i }
						onClick={ (e : React.MouseEvent, c : any = undefined) => onClick(e, c, children) }
					>
						{ contentStr }
					</TD>
				);
			});
		}
		return tmp;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ onClick ]);

	React.useEffect(() => {
		updateCols(renderCols(columns, children));
	}, [ columns, children, renderCols ]);

	return (
		<tr
			onClick={ (e : React.MouseEvent, c : any = undefined) => (!cols && cols.length < 1) ? onClick(e, c, children) : undefined }
			style={ clickable ? {
				cursor: "pointer"
			} : null }
		>
			{ (cols && cols.length > 0) ? cols : null }
		</tr>
	);
};

export default TR;