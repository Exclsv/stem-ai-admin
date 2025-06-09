import { lazy, FC, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import TopBarProgress from 'react-topbar-progress-indicator';
import { ROUTES } from '../../_metronic/helpers/constants/routes';
import { MasterLayout } from '../../_metronic/layout/MasterLayout';
import { DashboardWrapper } from '../pages/dashboard/DashboardWrapper';
import { MenuTestPage } from '../pages/MenuTestPage';
import { getCSSVariableValue } from '../../_metronic/assets/ts/_utils';
import { WithChildren } from '../../_metronic/helpers';
import { CategoryPage } from '../pages/category';
import { LanguagePage } from '../pages/language';
import StepPage from '../pages/step';
import QuestionPage from '../pages/question';

const PrivateRoutes = () => {
	const ProfilePage = lazy(() => import('../modules/profile/ProfilePage'));
	const WizardsPage = lazy(() => import('../modules/wizards/WizardsPage'));
	const AccountPage = lazy(() => import('../modules/accounts/AccountPage'));
	const WidgetsPage = lazy(() => import('../modules/widgets/WidgetsPage'));
	const ChatPage = lazy(() => import('../modules/apps/chat/ChatPage'));
	const UsersPage = lazy(
		() => import('../modules/apps/user-management/UsersPage')
	);

	return (
		<Routes>
			<Route element={<MasterLayout />}>
				<Route path="auth/*" element={<Navigate to={ROUTES.DASHBOARD} />} />
				<Route path={ROUTES.DASHBOARD} element={<DashboardWrapper />} />

				<Route path="menu-test" element={<MenuTestPage />} />
				<Route
					path={ROUTES.CATEGORY}
					element={
						<SuspensedView>
							<CategoryPage />
						</SuspensedView>
					}
				/>

				<Route
					path={ROUTES.QUESTION_GROUP}
					element={
						<SuspensedView>
							<StepPage />
						</SuspensedView>
					}
				/>

				<Route
					path={ROUTES.QUESTION}
					element={
						<SuspensedView>
							<QuestionPage />
						</SuspensedView>
					}
				/>

				<Route
					path={ROUTES.LANGUAGE}
					element={
						<SuspensedView>
							<LanguagePage />
						</SuspensedView>
					}
				/>

				<Route
					path="crafted/pages/profile/*"
					element={
						<SuspensedView>
							<ProfilePage />
						</SuspensedView>
					}
				/>
				{/* Lazy Modules */}
				<Route
					path="crafted/pages/profile/*"
					element={
						<SuspensedView>
							<ProfilePage />
						</SuspensedView>
					}
				/>
				<Route
					path="crafted/pages/wizards/*"
					element={
						<SuspensedView>
							<WizardsPage />
						</SuspensedView>
					}
				/>
				<Route
					path="crafted/widgets/*"
					element={
						<SuspensedView>
							<WidgetsPage />
						</SuspensedView>
					}
				/>
				<Route
					path="crafted/account/*"
					element={
						<SuspensedView>
							<AccountPage />
						</SuspensedView>
					}
				/>
				<Route
					path="apps/chat/*"
					element={
						<SuspensedView>
							<ChatPage />
						</SuspensedView>
					}
				/>
				<Route
					path="apps/user-management/*"
					element={
						<SuspensedView>
							<UsersPage />
						</SuspensedView>
					}
				/>

				{/* Page Not Found */}
				<Route path="*" element={<Navigate to="/error/404" />} />
			</Route>
		</Routes>
	);
};

const SuspensedView: FC<WithChildren> = ({ children }) => {
	const baseColor = getCSSVariableValue('--bs-primary');
	TopBarProgress.config({
		barColors: {
			'0': baseColor,
		},
		barThickness: 1,
		shadowBlur: 5,
	});
	return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>;
};

export { PrivateRoutes };
