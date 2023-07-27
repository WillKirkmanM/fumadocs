import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TreeNode, FileNode, FolderNode } from "next-docs-zeta/server";
import * as Base from "next-docs-zeta/sidebar";
import * as Collapsible from "@radix-ui/react-collapsible";
import { SearchBar } from "./search";
import { ScrollArea } from "@/components/ui/scroll-area";

export const SidebarProvider = Base.SidebarProvider;
export const SidebarTrigger = Base.SidebarTrigger;

export type SidebarProps = { items: TreeNode[]; children?: ReactNode };

export function Sidebar({ items, children }: SidebarProps) {
    return (
        <Base.SidebarList
            as="div"
            minWidth={768} // md
            className="nd-relative max-md:data-[open=false]:nd-hidden"
        >
            <aside
                className={clsx(
                    "nd-flex nd-flex-col",
                    children
                        ? "md:nd-h-[calc(100vh-3.5rem)]"
                        : "md:nd-max-h-[calc(100vh-3.5rem)]",
                    "md:nd-sticky md:nd-top-14",
                    "max-md:nd-fixed max-md:nd-inset-0 max-md:nd-px-8 max-md:nd-bg-background/50 max-md:nd-backdrop-blur-xl max-md:nd-z-40"
                )}
            >
                <ScrollArea className="nd-flex-1 [mask-image:linear-gradient(to_top,transparent,white_80px)]">
                    <div className="nd-flex nd-flex-col nd-gap-2 nd-pr-2 md:nd-py-16 max-md:nd-py-20">
                        <SearchBar className="nd-mb-4 sm:nd-hidden" />
                        {items.map((item, i) => (
                            <Node key={i} item={item} />
                        ))}
                    </div>
                </ScrollArea>
                {children && (
                    <div className="nd-border-t nd-pt-4 nd-pb-6">
                        {children}
                    </div>
                )}
            </aside>
        </Base.SidebarList>
    );
}

function Node({ item }: { item: TreeNode }) {
    if (item.type === "separator")
        return (
            <p className="nd-font-semibold nd-text-sm nd-mt-3 nd-mb-2 first-of-type:nd-mt-0">
                {item.name}
            </p>
        );
    if (item.type === "folder") return <Folder item={item} />;

    return <Item item={item} />;
}

function Item({ item }: { item: FileNode }) {
    const { url, name } = item;
    const pathname = usePathname();
    const active = pathname === url;

    return (
        <Link
            href={url}
            className={clsx(
                "nd-text-sm nd-w-full",
                active
                    ? "nd-text-primary nd-font-semibold"
                    : "nd-text-muted-foreground hover:nd-text-foreground"
            )}
        >
            {name}
        </Link>
    );
}

function Folder({ item }: { item: FolderNode }) {
    const { name, children, index } = item;

    const pathname = usePathname();
    const active = index && pathname === index.url;
    const childActive = pathname.startsWith(item.url + "/");
    const [extend, setExtend] = useState(active || childActive);

    useEffect(() => {
        if (active || childActive) {
            setExtend(true);
        }
    }, [active, childActive]);

    const onClick = () => {
        if (item.index == null || active) {
            setExtend((prev) => !prev);
        }
    };

    const As = index == null ? "p" : Link;
    return (
        <Collapsible.Root
            className="nd-w-full"
            open={extend}
            onOpenChange={setExtend}
        >
            <Collapsible.Trigger
                className={clsx(
                    "nd-flex nd-flex-row nd-text-sm nd-w-full nd-rounded-xl nd-text-start",
                    active
                        ? "nd-font-semibold nd-text-primary"
                        : "nd-text-muted-foreground hover:nd-text-foreground"
                )}
            >
                <As
                    href={index?.url as any}
                    className="nd-flex-1"
                    onClick={onClick}
                >
                    {name}
                </As>
                <ChevronDown
                    className={clsx(
                        "nd-w-4 nd-h-4 nd-transition-transform",
                        extend ? "nd-rotate-0" : "-nd-rotate-90"
                    )}
                />
            </Collapsible.Trigger>
            <Collapsible.Content asChild>
                <ul className="nd-overflow-hidden data-[state=closed]:nd-animate-collapsible-up data-[state=open]:nd-animate-collapsible-down">
                    {children.map((item, i) => {
                        const active =
                            item.type !== "separator" && pathname === item.url;

                        return (
                            <li
                                key={i}
                                className={clsx(
                                    "nd-flex nd-ml-2 nd-pl-4 nd-py-1.5 nd-border-l first:nd-mt-2",
                                    active
                                        ? "nd-border-primary"
                                        : "nd-border-border"
                                )}
                            >
                                <Node item={item} />
                            </li>
                        );
                    })}
                </ul>
            </Collapsible.Content>
        </Collapsible.Root>
    );
}
