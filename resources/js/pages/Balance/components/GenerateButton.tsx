import { Button } from '@/components/ui/button';
import balance from '@/routes/balance';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FileOutputIcon } from 'lucide-react';

export default function GenerateButton({ month, year }: number) {
    const {
        data: balances,
        isFetching,
        refetch,
    } = useQuery({
        queryKey: ['leave-balances-export', month, year],
        queryFn: async () => {
            const { data } = await axios.get(balance.export().url, {
                params: { month, year },
            });
            console.log(data);
            return data;
        },
        enabled: false,
        staleTime: 0,
    });

    console.log(balances);

    return (
        <Button
            onClick={() => refetch()}
            className="rounded-md border border-sky-700 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-700 hover:text-white dark:border-sky-600 dark:bg-sky-950 dark:text-sky-400 dark:hover:bg-sky-700 dark:hover:text-white"
        >
            <FileOutputIcon />
            Testing
        </Button>
    );
}
