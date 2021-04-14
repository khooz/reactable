import { CIdentity, IColumnDefinition } from "./@types/index";
import { CTargetAwareSort } from "./@types/index";

export const targetAwareSort : CTargetAwareSort = (columnDefinitions : IColumnDefinition[] = []) : IColumnDefinition[] => {
	let ap = columnDefinitions.map((i, x, s) => {
		if (i?.target && Array.isArray(i?.target))
		{
			let t : IColumnDefinition[] = [];
			i?.target.forEach(el => {
				t.push({...i, target: el});
			});
			s.splice(x,1,...t);
		}
		return i;
	});
	let r = ap.filter((i)=> !i?.target);
	let q = ap.filter((i)=> i?.target);
	q = q.sort((a, b) => <number> a?.target - <number> b?.target);
    q.forEach(i => r.splice(<number> i?.target, 0, i));
	return r;
};

export const IdentityFunction : CIdentity = i => i;