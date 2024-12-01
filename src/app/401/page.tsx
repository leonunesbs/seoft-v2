import { auth, signOut } from "~/server/auth";

import Form from "next/form";
import { redirect } from "next/navigation";
import { MdLogout } from "react-icons/md";
import { Button } from "~/components/ui/button";

export default async function Unauthorized() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }
  if (session?.user.isStaff) {
    redirect("/");
  }
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-4xl font-bold">401</h1>
      <p className="text-center text-lg">
        Você não tem permissão para acessar esta página.
      </p>
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
  );
}
