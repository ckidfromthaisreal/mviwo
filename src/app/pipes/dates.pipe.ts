import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'age'
})
export class AgePipe implements PipeTransform {
	transform(value: Date/*|moment.Moment*/, args: string[]): string {
		if (!value) {
			return '';
		}

		value = new Date(value);

		const today = new Date();
		let age = today.getFullYear() - value.getFullYear();
		const m = today.getMonth() - value.getMonth();
		const d = today.getDate() - value.getDate();
		if (m < 0 || (m === 0 && d < 0)) {
			age--;
		}

		return age > 0 ? `${age} year${age > 1 ? 's' : ''}` :
			m > 0 ? `${m} month${m > 1 ? 's' : ''}` :
				`${d} day${d > 1 || d === 0 ? 's' : ''}`;
	}
}

@Pipe({
	name: 'duration'
})
export class DurationPipe implements PipeTransform {
	transform(from: Date, to: Date, type: 'days' | 'months' | 'years' ): string {
		if (!from) {
			return '';
		}

		if (!to) {
			to = new Date();
		}

		from = new Date(from);

		let years = to.getFullYear() - from.getFullYear();
		const months = to.getMonth() - from.getMonth();
		const days = to.getDate() - from.getDate();
		if (months < 0 || (months === 0 && days < 0)) {
			years--;
		}

		return (!type && years > 0) || type === 'years' ? `${years} year${years > 1 ? 's' : ''}` :
			(!type && months > 0) || type === 'months' ? `${months} month${months > 1 ? 's' : ''}` :
			`${days} day${days > 1 ? 's' : ''}`;
	}
}
