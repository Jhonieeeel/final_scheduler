import balance from '@/routes/balance';
import { User } from '@/types';
import axios from 'axios';

type EventProp = {
    id: string;
    user_id: number;
    user: User;
    title: string;
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
    status: boolean;
};

export async function fetchUserStatus(month: string, year: string) {
    const res = await axios.get(balance.filing().url, {
        params: { month, year },
    });

    return res.data;
}

export async function fetchBalances(
    month: string,
    year: string,
    user_id: number,
) {
    const res = await axios.get(`/balances/user/${user_id}/data`, {
        params: { month, year },
    });
    return res.data;
}

export async function fetchCalendarEvents() {
    const res = await axios.get('/calendar/events/data');

    return res.data.calendarEvents.map((event: EventProp) => ({
        ...event,
        start: Temporal.PlainDate.from(event.start),
        end: Temporal.PlainDate.from(event.end),
    }));
}
