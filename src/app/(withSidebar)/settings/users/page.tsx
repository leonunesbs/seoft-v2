import { PageHeading } from "~/components/atoms/page-heading";
import { UsersTable } from "~/components/organisms/users-table";
import { db } from "~/server/db";

export default async function ClinicsPage() {
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isStaff: true,
      image: true,
    },
    orderBy: {
      name: "asc",
    },
  });
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>Usuários</PageHeading>
      <div>
        <UsersTable
          data={users.map(({ id, name, email, isStaff, image }) => ({
            id,
            name,
            email: email ?? "",
            isStaff,
            image,
          }))}
        />
      </div>
    </div>
  );
}
