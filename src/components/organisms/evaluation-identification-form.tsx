"use client";

import { type Collaborator, type Patient, type Prisma } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { type UseFormReturn } from "react-hook-form";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";

type EvaluationIdentificationFormProps = {
  form: UseFormReturn<{ collaborator: string; clinic: string }>;
  patient: Patient;
  collaborator: Collaborator;
  clinics: Prisma.ClinicGetPayload<{
    include: {
      collaborators: {
        select: {
          collaborator: {
            select: {
              name: true;
            };
          };
        };
      };
    };
  }>[];
};

export function EvaluationIdentificationForm({
  form,
  patient,
  clinics,
}: EvaluationIdentificationFormProps) {
  return (
    <Form {...form}>
      <form className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-1">
              <Badge variant="outline">{patient.refId}</Badge>
              <CardTitle>{patient.name}</CardTitle>
            </div>
            <CardDescription className="flex gap-2">
              <span>
                Idade:{" "}
                {new Date().getFullYear() - patient.birthDate.getFullYear()}
              </span>
              <span>-</span>
              <span className="text-sm text-muted-foreground">
                Nascimento:{" "}
                {patient.birthDate.toLocaleDateString("pt-BR", {
                  timeZone: "UTC",
                })}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex w-full flex-col gap-4 sm:flex-row">
              <FormField
                control={form.control}
                name="collaborator"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-3/5">
                    <FormLabel>Colaborador</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        className="cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clinic"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-2/5">
                    <FormLabel>Ambulatório</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        onValueChange={field.onChange}
                        value={field.value}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ambulatório" />
                        </SelectTrigger>
                        <SelectContent>
                          {clinics.map((clinic) => (
                            <SelectItem key={clinic.id} value={clinic.id}>
                              {clinic.name}
                              {clinic.collaborators.length > 0 &&
                                ` (${clinic.collaborators.map((collab) => collab.collaborator.name).join(", ")})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
