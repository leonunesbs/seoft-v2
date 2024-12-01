"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import React, { useMemo } from "react";

import { usePathname } from "next/navigation";

// Interface para configuração de rotas
interface RouteConfig {
  path: string; // Caminho exato ou dinâmico
  label: (params?: Record<string, string>) => string; // Suporte a parâmetros dinâmicos
  redirectUrl?: string; // URL personalizada para redirecionamento
  children?: RouteConfig[];
}

// Configuração centralizada das rotas
const routeConfig: RouteConfig[] = [
  {
    path: "/",
    label: () => "Painel",
    redirectUrl: "/",
  },
  {
    path: "/evaluation",
    label: () => "Avaliação",
    redirectUrl: "/evaluation",
    children: [
      {
        path: "/evaluations/pending",
        label: () => "Avaliações Pendentes",
        redirectUrl: "/evaluations/pending",
      },
      {
        path: "/evaluations/:id",
        label: () => `Detalhes da Avaliação`,
        redirectUrl: "/evaluation",
      },
    ],
  },
  {
    path: "/patients",
    label: () => "Pacientes",
    redirectUrl: "#",
    children: [
      {
        path: "/patients/add",
        label: () => "Adicionar",
        redirectUrl: "/patients/add",
      },
      {
        path: "/patients/search",
        label: () => "Buscar",
        redirectUrl: "/patients/search",
      },
      {
        path: "/patients/:id",
        label: () => `Detalhes`,
        redirectUrl: "/patients",
      },
    ],
  },
  {
    path: "/settings",
    label: () => "Ajustes",
    redirectUrl: "#",
    children: [
      {
        path: "/settings/staffs",
        label: () => "Staffs",
        redirectUrl: "/settings/staffs",
      },
      {
        path: "/settings/staffs/add",
        label: () => "Adicionar",
        redirectUrl: "/settings/staffs/add",
      },
      {
        path: "/settings/staffs/:id",
        label: () => `Detalhes`,
        redirectUrl: "/settings/staffs",
      },
      {
        path: "/settings/clinics",
        label: () => "Ambulatórios",
        redirectUrl: "/settings/clinics",
      },
      {
        path: "/settings/clinics/add",
        label: () => "Adicionar",
        redirectUrl: "/settings/clinics/add",
      },
      {
        path: "/settings/clinics/:id",
        label: () => "Detalhes",
        redirectUrl: "/settings/clinics",
      },
    ],
  },
];

// Função para gerar breadcrumbs a partir do caminho
const generateBreadcrumbs = (
  pathname: string,
  routes: RouteConfig[],
): { href: string; label: string }[] => {
  const segments = pathname.split("/").filter(Boolean); // Divide o caminho
  const breadcrumbs: { href: string; label: string }[] = [];
  let currentPath = "";

  // Itera pelos segmentos do caminho
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const matchedRoute = routes.find((route) => {
      const pathRegex = new RegExp(`^${route.path.replace(/:\w+/g, "[^/]+")}$`);
      return pathRegex.test(currentPath);
    });

    if (matchedRoute) {
      const params: Record<string, string> = {};
      // Extrai parâmetros dinâmicos
      const dynamicSegments = matchedRoute.path.match(/:\w+/g) ?? [];
      dynamicSegments.forEach((param) => {
        const key = param.slice(1);
        const value = segments[index];
        params[key] = value ?? "";
      });

      breadcrumbs.push({
        href: matchedRoute.redirectUrl ?? currentPath, // Usa redirectUrl se configurado
        label: matchedRoute.label(params),
      });

      // Adiciona os filhos para continuar buscando
      if (matchedRoute.children) {
        routes = matchedRoute.children;
      }
    }
  });

  return breadcrumbs;
};

export function CustomBreadcrumbs() {
  const pathname = usePathname();

  // Gera os breadcrumbs dinamicamente
  const breadcrumbs = useMemo(
    () => generateBreadcrumbs(pathname, routeConfig),
    [pathname],
  );

  // Se não houver breadcrumbs, não renderiza
  if (breadcrumbs.length === 0) return null;

  const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];

  return (
    <Breadcrumb>
      {/* Breadcrumb completo para telas maiores */}
      <BreadcrumbList className="hidden md:flex">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <React.Fragment key={breadcrumb.label}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage aria-current="page">
                    {breadcrumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={breadcrumb.href}>
                    {breadcrumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>

      {/* Breadcrumb reduzido para telas menores */}
      <BreadcrumbList className="flex md:hidden">
        <BreadcrumbItem>
          <BreadcrumbPage aria-current="page">
            {lastBreadcrumb!.label}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
