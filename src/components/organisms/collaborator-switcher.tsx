"use client";

import * as React from "react";

import { type Collaborator, type Role } from "@prisma/client/edge";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

import { useRouter } from "next/navigation";
import { FaUserMd } from "react-icons/fa";
import { Skeleton } from "../ui/skeleton";

export function CollaboratorSwitcher({
  collaborators,
  defaultVersion,
}: {
  collaborators: Collaborator[];
  defaultVersion?: string;
}) {
  const router = useRouter();
  const [selectedCollaborator, setSelectedCollaborator] = React.useState<
    string | undefined
  >();
  const [loading, setLoading] = React.useState(true);

  // Ordenar e agrupar colaboradores por Role
  const groupedCollaborators = React.useMemo(() => {
    const roleOrder = ["R1", "R2", "R3", "F1", "F2", "F3", "STAFF"] as Role[];

    // Filtrar e agrupar ignorando os grupos "I1", "I2", "I3", "I4"
    const filteredCollaborators = collaborators.filter(
      (collaborator) =>
        !collaborator.role.startsWith("I") && collaborator.role !== "STAFF",
    );

    return roleOrder.map((role) => ({
      role,
      collaborators: filteredCollaborators.filter(
        (collaborator) => collaborator.role === role,
      ),
    }));
  }, [collaborators]);

  const handleSelect = React.useCallback(
    async (collaborator: Collaborator) => {
      setLoading(true);
      if (collaborator.id === selectedCollaborator) return;
      await fetch("/api/v1/collaborator-switcher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaboratorId: collaborator.id }),
      }).then(() => {
        setSelectedCollaborator(collaborator.id);
      });
      setLoading(false);
      router.refresh();
    },
    [router, selectedCollaborator],
  );

  React.useEffect(() => {
    void fetch("/api/v1/collaborator-switcher")
      .then((res) => res.json())
      .then((data: { collaboratorId?: string }) => {
        if (data.collaboratorId) {
          setSelectedCollaborator(data.collaboratorId);
        }
      })
      .finally(() => setLoading(false));
  }, [defaultVersion, handleSelect]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <FaUserMd />
              </div>
              <div className="flex w-full flex-col gap-0.5 leading-none">
                <span className="font-semibold">SEOFT</span>
                <span className="line-clamp-1">
                  {loading ? (
                    <Skeleton className="h-3.5" />
                  ) : (
                    (collaborators.find(
                      (collaborator) =>
                        collaborator.id === selectedCollaborator,
                    )?.name ?? "Selecione...")
                  )}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width]"
            align="start"
          >
            {loading ? (
              <DropdownMenuItem disabled>
                <div className="h-4 w-full animate-pulse rounded bg-gray-300"></div>
              </DropdownMenuItem>
            ) : (
              groupedCollaborators.map((group) =>
                group.collaborators.length > 0 ? (
                  <div key={group.role} className="p-2">
                    <div className="mb-1 text-sm font-semibold uppercase text-gray-500">
                      {group.role}
                    </div>
                    {group.collaborators.map((collaborator) => (
                      <DropdownMenuItem
                        key={collaborator.id}
                        onSelect={() => handleSelect(collaborator)}
                      >
                        [{collaborator.crm}] {collaborator.name}{" "}
                        {collaborator.id === selectedCollaborator && (
                          <Check className="ml-auto" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                ) : null,
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
