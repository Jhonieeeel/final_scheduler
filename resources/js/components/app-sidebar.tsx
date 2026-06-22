import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import balance from '@/routes/balance';
import leave from '@/routes/leave';
import undertime from '@/routes/undertime';
import type { MainNav } from '@/types';
import { Link } from '@inertiajs/react';
import {
    CalendarArrowUp,
    LayoutGrid,
    ListOrdered,
    TimerOff,
} from 'lucide-react';

const mainNavItems: MainNav[] = [
    {
        groupLabel: 'Platform',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ],
    },
    {
        groupLabel: 'Tracking',
        items: [
            {
                title: 'Balances',
                href: balance.index(),
                icon: ListOrdered,
            },
            {
                title: 'File Leave',
                href: leave.index(),
                icon: CalendarArrowUp,
            },
            {
                title: 'File Undertime',
                href: undertime.index(),
                icon: TimerOff,
            },
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={[]} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
