import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import balance from '@/routes/balance';
import { useForm, usePage } from '@inertiajs/react';
import { FileOutputIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

type ButtonProp = {
    month: string;
    year: string;
};

type PageProps = {
    flash?: {
        downloadUrl?: string;
    };
};

export default function GenerateButton({ month, year }: ButtonProp) {
    // Grab the shared flash property from Inertia
    const { flash } = usePage<PageProps>().props;

    const form = useForm({
        month: month,
        year: year,
        url: flash?.downloadUrl,
    });

    useEffect(() => {
        if (flash?.downloadUrl) {
            window.location.assign(flash?.downloadUrl);
        }
    }, [flash?.downloadUrl]);

    function handleGenerate() {
        form.setData({ month, year });

        form.post(balance.export().url, {
            onSuccess: (page) => {
                const downloadUrl = (page.props as PageProps).flash
                    ?.downloadUrl;
                if (downloadUrl) {
                    window.location.assign(downloadUrl);
                }
            },
        });
    }

    return (
        <Button
            onClick={handleGenerate}
            disabled={form.processing}
            variant="outline-sky"
        >
            {form.processing ? <Spinner /> : <FileOutputIcon />}
            <span className="ml-1.5">Export</span>
        </Button>
    );
}
