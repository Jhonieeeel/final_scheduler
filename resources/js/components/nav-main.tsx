import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { MainNav } from '@/types';
import { Link } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: MainNav[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            {items.map((item) => (
                <div className="mt-5" key={item.groupLabel}>
                    <SidebarGroupLabel>{item.groupLabel}</SidebarGroupLabel>
                    <SidebarMenu>
                        {item.items.map((data) => (
                            <SidebarMenuItem key={data.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(data.href)}
                                    tooltip={{ children: data.title }}
                                >
                                    <Link href={data.href} prefetch>
                                        {data.icon && <data.icon />}
                                        <span>{data.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </div>
            ))}
        </SidebarGroup>
    );
}
