import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { auth, signOut } from "~/server/auth";

import Form from "next/form";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { MdLogout } from "react-icons/md";
import { ThemeToggle } from "~/components/atoms/theme-toggle";
import { CustomBreadcrumbs } from "~/components/molecules/custom-breadcrumbs";
import { AppSidebar } from "~/components/organisms/app-sidebar";
import { Button } from "~/components/ui/button";
import { db } from "~/server/db";
import { HydrateClient } from "~/trpc/server";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    // return redirect("/signin");
  }

  const cookieStore = await cookies();
  const collaboratorId =
    cookieStore.get("selected-collaborator")?.value ?? null;

  const collaborators = await db.collaborator.findMany({
    where: {
      role: {
        in: ["R1", "R2", "R3", "F1", "F2", "F3", "STAFF"],
      },
    },
    orderBy: {
      name: "asc",
    },
  });
  return (
    <SidebarProvider>
      <AppSidebar
        collaborators={collaborators}
        currentCollaboratorId={collaboratorId ?? undefined}
      />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 max-h-16 grow items-center justify-between gap-2 border-b bg-background px-4 md:px-6 lg:px-8">
          <div className="flex items-center">
            <SidebarTrigger className="-ml-1 mr-1" />
            <Link
              href={"/"}
              className={
                "relative ml-1 mr-3 flex h-8 w-8 shrink-0 overflow-hidden rounded-full"
              }
            >
              <Image
                alt="iSEOFT"
                src="/iSEOFT-logo.png"
                className={"aspect-square h-full w-full object-cover"}
                width={40} // Definindo tamanho padrão do avatar (40x40)
                height={40}
              />
            </Link>
            <HydrateClient>
              <CustomBreadcrumbs />
            </HydrateClient>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <Button variant={"outline"} type="submit">
                <MdLogout size={18} /> Sair
              </Button>
            </Form>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-4 px-2 py-4 md:px-4 lg:px-8">
          {children}
        </main>
        <footer className="flex">
          <span className="w-full bg-sidebar-primary py-1 text-center text-xs text-sidebar-primary-foreground">
            Coded with ❤️ by{" "}
            <Link
              href={"https://github.com/leonunesbs"}
              className="link font-bold no-underline"
              target="_blank"
            >
              @leonunesbs
            </Link>
          </span>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
