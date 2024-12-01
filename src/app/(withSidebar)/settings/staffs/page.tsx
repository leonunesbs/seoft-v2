import Link from "next/link";
import { MdAddCircleOutline } from "react-icons/md";
import { PageHeading } from "~/components/atoms/page-heading";
import { StaffsTable } from "~/components/organisms/staffs-table";
import { Button } from "~/components/ui/button";
import { db } from "~/server/db";

export default async function StaffsPage() {
  const staffs = await db.collaborator.findMany({
    include: {
      clinics: {
        include: {
          clinic: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
    // include only staffs
    where: {
      role: "STAFF",
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <PageHeading>Staffs</PageHeading>
        <Link href="/settings/staffs/add" passHref>
          <Button>
            <MdAddCircleOutline size={18} />
            Adicionar
          </Button>
        </Link>
      </div>
      <div>
        <StaffsTable
          data={staffs.map((staff) => ({
            ...staff,
            clinic: staff.clinics.map((clinicAssoc) => ({
              id: clinicAssoc.clinic.id,
              name: clinicAssoc.clinic.name,
            })),
          }))}
        />
      </div>
    </div>
  );
}
