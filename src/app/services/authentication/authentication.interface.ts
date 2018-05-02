/**
 * http response for user register/login requests.
 */
export interface TokenResponse {
	token: string;
}

export interface RegistrationPayload {
	email: string;
	username: string;
	password: string;
}

export interface LoginPayload {
	login: string;
	password: string;
}

export interface UserDetails {
	_id: string;
	username: string;
	email: string;
	permissions: string[];
	exp: number;
}
