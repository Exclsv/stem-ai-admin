import { MenuItem } from './SidebarMenuMain';
import { ROUTES } from '../../../../helpers/constants/routes';

export const menuRoutes: MenuItem[] = [
	{
		to: ROUTES.DASHBOARD,
		icon: 'dashboard',
		titleId: 'MENU.DASHBOARD',
		fontIcon: 'bi-chat-left',
	},
	{
		to: ROUTES.CATEGORY,
		icon: 'setting-3',
		titleId: 'MENU.CATEGORY',
		fontIcon: 'bi-chat-left',
	},
	{
		to: ROUTES.LANGUAGE,
		icon: 'setting-3',
		titleId: 'MENU.LANGUAGE',
		fontIcon: 'bi-chat-left',
	},
];
