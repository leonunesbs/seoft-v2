# Projeto SEOFT

Este repositório contém o projeto **SEOFT**, desenvolvido com a T3 Stack, utilizando Next.js, TypeScript, Tailwind CSS, tRPC e Prisma.

## Sobre a Plataforma

A plataforma **SEOFT** não é um prontuário digital. Ela atua como um intermediador, organizando e armazenando algumas informações do atendimento dos pacientes para facilitar a dinâmica dos atendimentos no dia a dia. Com um design focado na eficiência e simplicidade, o SEOFT auxilia os colaboradores a acessarem e registrarem informações de maneira mais prática e ágil.

O acesso à plataforma é **restrito aos colaboradores do SEOFT**, garantindo a segurança das informações e o uso exclusivo por pessoas autorizadas.

## Estrutura do Projeto

A estrutura de diretórios do projeto é organizada da seguinte forma:

- **.github/workflows/**: Configurações para integração contínua e automações do GitHub Actions.
- **.husky/**: Hooks do Git para garantir a qualidade do código antes de commits e push.
- **prisma/**: Esquemas e migrações do banco de dados gerenciados pelo Prisma.
- **public/**: Arquivos estáticos acessíveis publicamente, como imagens e fontes.
- **src/**: Código-fonte principal da aplicação, incluindo páginas, componentes e estilos.

## Tecnologias Utilizadas

- **Next.js**: Framework React para renderização híbrida e geração de sites estáticos.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática ao código.
- **Tailwind CSS**: Framework CSS utilitário para estilização rápida e eficiente.
- **tRPC**: Facilita a criação de APIs type-safe com TypeScript.
- **Prisma**: ORM para interação com o banco de dados de forma segura e eficiente.

## Configuração e Instalação

1. **Clone o repositório**:

   ```bash
   git clone https://github.com/leonunesbs/seoft.git
   ```

2. **Instale as dependências**:

   ```bash
   pnpm install
   ```

3. **Configure as variáveis de ambiente**:

   Renomeie o arquivo `.env.example` para `.env` e ajuste as variáveis conforme necessário.

4. **Execute o projeto**:

   ```bash
   pnpm dev
   ```

   A aplicação estará disponível em `http://localhost:3000`.

## Scripts Disponíveis

- `pnpm dev`: Inicia o servidor de desenvolvimento.
- `pnpm build`: Compila a aplicação para produção.
- `pnpm start`: Inicia o servidor em modo de produção.
- `pnpm lint`: Executa o linter para verificar a qualidade do código.

## Contribuição

Contribuições são bem-vindas! Siga os passos abaixo para contribuir:

1. **Fork o repositório**.
2. **Crie uma nova branch**: `git checkout -b minha-feature`.
3. **Faça as alterações desejadas** e commit: `git commit -m 'Minha nova feature'`.
4. **Envie para o repositório remoto**: `git push origin minha-feature`.
5. **Abra um Pull Request** para revisão.

## Licença

Este projeto está licenciado sob a Licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.
