import {
	Injectable
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class MessengerService {
	private messageSource = new BehaviorSubject(undefined);
	private currentMessage = this.messageSource.asObservable();

	constructor() {}

	send(message: string): void {
		this.messageSource.next(message);
	}

	receive(): Observable<any> {
		return this.currentMessage;
	}

	subscribe(callback: (message: any) => void) {
		this.currentMessage.subscribe(callback);
	}
}
