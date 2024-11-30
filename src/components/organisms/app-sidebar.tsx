import { type Collaborator } from "@prisma/client";
import Link from "next/link";
import * as React from "react";
import {
  MdGroup,
  MdOutlineArchive,
  MdOutlineAssignmentInd,
  MdOutlineAssistant,
  MdOutlineAttribution,
  MdOutlineLockPerson,
  MdOutlinePersonAdd,
  MdOutlineSearch,
  MdSettings,
} from "react-icons/md";

import { CollaboratorSwitcher } from "~/components/organisms/collaborator-switcher";
import { SearchForm } from "~/components/organisms/search-form";
import { Badge } from "~/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "~/components/ui/sidebar";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  collaborators: Collaborator[];
  pedingEvaluations?: number;
}

export function AppSidebar({
  collaborators,
  pedingEvaluations,
  ...props
}: AppSidebarProps) {
  const data: {
    navMain: {
      title: string;
      url: string;
      icon?: React.ReactNode;
      items: {
        title: string;
        url: string;
        icon?: React.ReactNode;
      }[];
    }[];
  } = {
    navMain: [
      {
        title: "Avaliações",
        url: "#",
        icon: <MdOutlineArchive size={18} />,
        items: [
          {
            title: "Em andamento",
            url: "/evaluations/pending",
            icon: (
              <Badge
                variant={
                  pedingEvaluations
                    ? pedingEvaluations > 0
                      ? "default"
                      : "outline"
                    : "outline"
                }
                className="flex size-4 justify-center px-0 text-center"
              >
                {pedingEvaluations}
              </Badge>
            ),
          },
        ],
      },
      {
        title: "Pacientes",
        url: "#",
        icon: <MdGroup size={18} />,
        items: [
          {
            title: "Buscar",
            url: "/patients/search",
            icon: <MdOutlineSearch size={18} />,
          },
          {
            title: "Adicionar",
            url: "/patients/add",
            icon: <MdOutlinePersonAdd size={18} />,
          },
        ],
      },

      {
        title: "Ajustes",
        url: "#",
        icon: <MdSettings size={18} />,
        items: [
          {
            title: "Staffs",
            url: "/settings/staffs",
            icon: <MdOutlineAssignmentInd size={18} />,
          },
          {
            title: "Usuários",
            url: "/settings/users",
            icon: <MdOutlineLockPerson size={18} />,
          },
          {
            title: "Residentes",
            url: "/settings/residents",
            icon: <MdOutlineAssistant size={18} />,
          },
          {
            title: "Ambulatórios",
            url: "/settings/clinics",
            icon: <MdOutlineAttribution size={18} />,
          },
        ],
      },
    ],
  };
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <CollaboratorSwitcher collaborators={collaborators} />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url} className="font-medium">
                    {item.icon} {item.title}
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild href={subItem.url}>
                          <Link href={subItem.url}>
                            {subItem.icon} {subItem.title}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
