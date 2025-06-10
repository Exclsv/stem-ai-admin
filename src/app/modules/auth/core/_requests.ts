import axios from 'axios';
import { AuthModel, UserModel } from './_models';

const API_URL = import.meta.env.VITE_APP_API_URL;

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/auth/me`;
export const LOGIN_URL = `${API_URL}/auth/login/`;
export const REGISTER_URL = `${API_URL}/auth/register/`;
export const REQUEST_PASSWORD_URL = `${API_URL}/auth/password-reset/`;
export const CHANGE_PASSWORD_URL = `${API_URL}/auth/change-password/`;

// Server should return AuthModel
export function login(username: string, password: string) {
	return axios.post<AuthModel>(LOGIN_URL, {
		username,
		password,
	});
}

// Server should return AuthModel
export function register(
	email: string,
	firstname: string,
	lastname: string,
	password: string,
	password_confirmation: string
) {
	return axios.post(REGISTER_URL, {
		email,
		first_name: firstname,
		last_name: lastname,
		password,
		password_confirmation,
	});
}

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string) {
	return axios.post<{ result: boolean }>(REQUEST_PASSWORD_URL, {
		email,
	});
}

export function getUserByToken(token: string) {
	return axios.get<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
}

export function changePassword(oldPassword: string, newPassword: string) {
	return axios.post(CHANGE_PASSWORD_URL, {
		old_password: oldPassword,
		new_password: newPassword,
	});
}
