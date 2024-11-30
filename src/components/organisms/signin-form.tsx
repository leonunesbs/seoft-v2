import { IoLogoGithub, IoLogoGoogle } from "react-icons/io5";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import Form from "next/form";
import { type ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { signIn } from "~/server/auth";
import { providerMap } from "~/server/auth/config";

export function SignInForm({ callbackUrl }: { callbackUrl?: string }) {
  const iconsMap: Record<string, ReactNode> = {
    GitHub: <IoLogoGithub aria-hidden="true" />,
    Google: <IoLogoGoogle aria-hidden="true" />,
  };

  const newProviderMap = providerMap.map((provider) => {
    return {
      ...provider,
      icon: iconsMap[provider.name],
    };
  });

  return (
    <Card
      className="mx-auto w-full max-w-sm"
      role="form"
      aria-labelledby="sign-in-title"
      aria-describedby="sign-in-description"
    >
      <CardHeader>
        <CardTitle id="sign-in-title" className="text-2xl">
          Entrar
        </CardTitle>
        <CardDescription id="sign-in-description">
          Acesse sua conta para continuar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Form
            className="grid gap-4"
            aria-label="Formulário para entrar com email"
            action={async (formData) => {
              "use server";
              const email = formData.get("email");
              if (!email) {
                console.error("Email é obrigatório");
              }
              await signIn("resend", {
                email,
                redirectTo: callbackUrl ?? "",
              });
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                aria-required="true"
                required
                aria-describedby="email-description"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              aria-label="Entrar com Email"
            >
              Entrar com Email
            </Button>
          </Form>
          <Separator aria-hidden="true" />
          {Object.values(newProviderMap).map((provider) => (
            <Form
              key={provider.id}
              aria-label={`Formulário para entrar com ${provider.name}`}
              action={async () => {
                "use server";
                await signIn(provider.id, {
                  redirectTo: callbackUrl ?? "",
                });
              }}
            >
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                aria-label={`Entrar com ${provider.name}`}
              >
                {provider.icon} Entrar com {provider.name}
              </Button>
            </Form>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
