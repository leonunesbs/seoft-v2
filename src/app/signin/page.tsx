import { redirect } from "next/navigation";
import { SignInForm } from "~/components/organisms/signin-form";
import { auth } from "~/server/auth";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Login(props: { searchParams: SearchParams }) {
  const { callbackUrl } = await props.searchParams;
  const session = await auth();
  if (session?.user) {
    redirect("/" as string);
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <SignInForm callbackUrl={callbackUrl as string} />
    </div>
  );
}
