"use client";

import React, { useMemo } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

import { usePathname } from "next/navigation";

// Define a interface para configuração de breadcrumbs
interface BreadcrumbConfig {
  path: string;
  label: string;
  redirectUrl?: string; // URL opcional de redirecionamento
  children?: BreadcrumbConfig[];
}

// Configuração de rotas estáticas
const staticRoutes: BreadcrumbConfig[] = [
  { path: "/", label: "Painel", redirectUrl: "#" },
  {
    path: "/evaluation",
    label: "Avaliação",
    redirectUrl: "#",
    children: [{ path: "/evaluation/pending", label: "Avaliações Pendentes" }],
  },
  {
    path: "/patient",
    label: "Pacientes",
    redirectUrl: "#",
    children: [
      { path: "/patient/add", label: "Adicionar Paciente" },
      { path: "/patient/search", label: "Buscar Paciente" },
    ],
  },
];

// Configuração de rotas dinâmicas
const dynamicRoutes: BreadcrumbConfig[] = [
  { path: "/evaluation/:id", label: "Detalhes da Avaliação" },
  { path: "/patient/:id", label: "Detalhes do Paciente" },
];

// Função para mesclar rotas dinâmicas e estáticas
const mergeRoutes = (
  staticRoutes: BreadcrumbConfig[],
  dynamicRoutes: BreadcrumbConfig[],
) => {
  const isDynamicRoute = (route: string) => route.includes(":");

  return staticRoutes.map((staticRoute) => {
    // Filtrar rotas dinâmicas que pertencem ao escopo da rota estática
    const scopedDynamicRoutes = dynamicRoutes.filter((dynamicRoute) =>
      dynamicRoute.path.startsWith(staticRoute.path),
    );

    return {
      ...staticRoute,
      children: [
        ...(staticRoute.children ?? []),
        ...scopedDynamicRoutes.filter(
          (dynamicRoute) =>
            !staticRoute.children?.some(
              (child) => child.path === dynamicRoute.path,
            ) && isDynamicRoute(dynamicRoute.path),
        ),
      ],
    };
  });
};

const breadcrumbConfig = mergeRoutes(staticRoutes, dynamicRoutes);

// Função para encontrar os breadcrumbs de acordo com o caminho
const findBreadcrumbs = (
  pathname: string,
  routes: BreadcrumbConfig[],
): BreadcrumbConfig[] | null => {
  for (const route of routes) {
    const isDynamic = route.path.includes(":");
    const pathRegex = new RegExp(`^${route.path.replace(/:\w+/g, "[^/]+")}$`); // Substitui segmentos dinâmicos por regex

    if (
      pathname === route.path ||
      (!isDynamic && pathname.startsWith(route.path))
    ) {
      if (!route.children) return [route];

      const childBreadcrumbs = findBreadcrumbs(pathname, route.children);
      return childBreadcrumbs ? [route, ...childBreadcrumbs] : [route];
    }

    if (isDynamic && pathRegex.test(pathname)) {
      return [route];
    }
  }

  return null;
};

export function CustomBreadcrumbs() {
  const pathname = usePathname();

  // Memorize os breadcrumbs para evitar cálculos repetidos
  const breadcrumbs = useMemo(
    () => findBreadcrumbs(pathname, breadcrumbConfig),
    [pathname],
  );

  if (!breadcrumbs || breadcrumbs.length === 0) return null;

  const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];

  return (
    <Breadcrumb>
      {/* Breadcrumb completo para telas maiores */}
      <BreadcrumbList className="hidden md:flex">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <React.Fragment key={breadcrumb.path}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage aria-current="page">
                    {breadcrumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={breadcrumb.redirectUrl ?? breadcrumb.path}
                  >
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
            {lastBreadcrumb?.label}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
