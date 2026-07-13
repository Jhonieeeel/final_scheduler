import { Link } from '@inertiajs/react';

type LinkProp = {
    links: [
        {
            url: string;
            label: string;
            active: boolean;
        },
    ];
};

export default function Pagination({ links }: LinkProp) {
    return (
        <div className="mt-4 flex flex-wrap items-center space-x-1">
            {links?.map((data, index) => (
                <Link
                    key={index}
                    href={data.url ?? '#'}
                    prefetch
                    dangerouslySetInnerHTML={{ __html: data.label }}
                    className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                        data.active
                            ? 'border-sky-600 bg-sky-600 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-sky-600 hover:bg-sky-600 hover:text-white'
                    } ${
                        !data.url
                            ? 'pointer-events-none cursor-not-allowed opacity-50'
                            : ''
                    } `}
                />
            ))}
        </div>
    );
}
