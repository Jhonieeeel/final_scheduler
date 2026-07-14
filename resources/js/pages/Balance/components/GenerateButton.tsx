import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import balance from '@/routes/balance';
import { useForm } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FileOutputIcon } from 'lucide-react';

type ButtonProp = {
    month: string;
    year: string;
    user_id: number;
    filepath: string;
};

export default function GenerateButton({
    month,
    year,
    user_id,
    filepath,
}: ButtonProp) {
    // const {
    //     data: balances,
    //     isFetching,
    //     refetch,
    // } = useQuery({
    //     queryKey: ['leave-balances-export', month, year],
    //     queryFn: async () => {
    //         const { data } = await axios.get(balance.export().url, {
    //             params: { month, year },
    //         });
    //         return data;
    //     },
    //     enabled: false,
    //     staleTime: 0,
    // });

    const form = useForm({
        month: month,
        year: year,
        user_id: user_id ?? undefined,
        filepath: filepath,
    });

    function handleGenerate() {
        form.get(balance.export().url, {
            onSuccess: () => {},
            preserveState: true,
        });

        if (form.data.filepath) {
            form.get(balance.download().url);
        }
    }

    return (
        <Button
            onClick={handleGenerate}
            className="rounded-md border border-sky-700 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-700 hover:text-white dark:border-sky-600 dark:bg-sky-950 dark:text-sky-400 dark:hover:bg-sky-700 dark:hover:text-white"
        >
            {form.processing ? <Spinner /> : <FileOutputIcon />}
            Testing
        </Button>
    );
}
