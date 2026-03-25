import { getRangeDateForFilter } from './date';
import { views } from './table';

const isProduction = process.env.NODE_ENV === 'production';

const domain = 'expense.fyi';
const local = 'localhost:3000';
const home = isProduction ? domain : local;

const url = {
	homeWithoutApp: home,
	home: isProduction ? `https://${home}` : `http://${home}`,
	api: '',
	serverApi: `${isProduction ? 'https://' : 'http://'}${home}`,
	app: {
		signin: '/signin',
		signup: '/signup',
		overview: '/dashboard',
	},
	twitter: 'https://twitter.com/gokul_i',
};

export const getApiUrl = (filterKey: string, apiPath: string, categories: string[] = [], isNotRange = false) => {
	if (isNotRange) {
		return `/api/${apiPath}`;
	}

	if (filterKey === views.all.key) {
		return `/api/${apiPath}?categories=${categories?.join(',')}`;
	}

	const [start, end] = getRangeDateForFilter(filterKey);
	return `/api/${apiPath}?from=${start}&to=${end}&categories=${categories?.join(',')}`;
};

export default url;
