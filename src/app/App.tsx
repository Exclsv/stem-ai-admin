import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { I18nProvider } from '../_metronic/i18n/i18nProvider';
import { LayoutProvider, LayoutSplashScreen } from '../_metronic/layout/core';
import { MasterInit } from '../_metronic/layout/MasterInit';
import { AuthInit } from './modules/auth';
import { ThemeModeProvider } from '../_metronic/partials';
import { ToastContainer, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setupApiClient } from './hooks/apiClient';

const App = () => {
	useEffect(() => {
		setupApiClient();
	}, []);

	return (
		<Suspense fallback={<LayoutSplashScreen />}>
			<I18nProvider>
				<ToastContainer
					position="top-right"
					autoClose={1500}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					transition={Flip}
				/>
				<LayoutProvider>
					<ThemeModeProvider>
						<AuthInit>
							<Outlet />
							<MasterInit />
						</AuthInit>
					</ThemeModeProvider>
				</LayoutProvider>
			</I18nProvider>
		</Suspense>
	);
};

export { App };
