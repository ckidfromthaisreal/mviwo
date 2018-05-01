/**
 * http response for user register/login requests.
 */
export interface TokenResponse {
	token: string;
}

/**
 *
 */
export interface TokenPayload {
	email?: string;
	password: string;
	username?: string;
}

export interface UserDetails {
	_id: string;
	username: string;
	email: string;
	permissions: string[];
	exp: number;
}
