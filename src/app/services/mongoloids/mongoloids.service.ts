import {
	Injectable
} from '@angular/core';
import { Mongoloid } from '../crud/crud.service';

@Injectable({
	providedIn: 'root'
})
export class MongoloidsService {
	constructor() {}

	public sameValuesAndOrder(arr1: Mongoloid[], arr2: Mongoloid[]): boolean {
		if (!arr1 || !arr2 || arr1.length !== arr2.length) {
			return false;
		}

		for (let i = 0; i < arr1.length; i++) {
			if (arr1[i]._id !== arr2[i]._id) {
				return false;
			}
		}

		return true;
	}
}
