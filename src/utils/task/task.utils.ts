export function getNumberParam(param: string | string[] | undefined, defaultValue: number): number {
	if (!param) return defaultValue;

	const str = Array.isArray(param) ? param[0] : param;
	const num = Number.parseInt(str, 10);

	return isNaN(num) ? defaultValue : num;
}
