# Desafio Técnico: Sistema de Controle de Gastos Residenciais

Este projeto é um sistema de controle de gastos residenciais completo, com cadastro de moradores, controle de transações financeiras (receitas e despesas), validações de regras de negócios e geração de relatórios de saldos. Ele foi desenvolvido para atender às especificações solicitadas no desafio técnico prático.

---

## 🛠️ Tecnologias Utilizadas

### Back-end
- **Linguagem**: C# (.NET 8.0)
- **Framework**: ASP.NET Core Web API com Controllers
- **ORM**: Entity Framework Core (EF Core)
- **Banco de Dados**: SQLite (persistência local simples por arquivo `expenses.db`)

### Front-end
- **Linguagem**: TypeScript
- **Framework**: React (Vite)
- **Biblioteca de Ícones**: Lucide React
- **Comunicação com API**: Axios
- **Design e Interface**: CSS Vanilla Customizado com Dark Mode elegante, Glassmorphism e micro-animações.

---

## 📋 Regras de Negócio Implementadas

1. **Cadastro de Pessoas (Moradores)**:
   - Criação, listagem e exclusão de pessoas.
   - Identificadores únicos (`Guid`) gerados de forma automática no banco de dados.
   - **Exclusão em Cascata (Cascade Delete)**: Ao deletar um morador, todas as transações associadas a ele são apagadas automaticamente do banco de dados (configurado no relacionamento no `AppDbContext`).
2. **Cadastro de Transações**:
   - Criação e listagem de transações.
   - **Regra de Menoridade**: Se o morador responsável for menor de idade (menor de 18 anos), o sistema **bloqueia** o lançamento de receitas, permitindo apenas despesas. Essa regra é aplicada tanto na interface do front-end quanto no back-end (retornando `400 Bad Request` com mensagem informativa).
3. **Consulta de Totais**:
   - Tabela demonstrativa que calcula receitas, despesas e o saldo individual de cada morador de forma reativa.
   - Linha de **Total Geral** calculada e exibida na base do relatório exibindo as somas agregadas e o saldo líquido de toda a residência.

---

## 🚀 Como Executar o Projeto

Para executar ambos os projetos, certifique-se de possuir o Node.js e o SDK do .NET 8.0 instalados.

### 1. Executando o Back-end (.NET API)

Navegue até a pasta do back-end a partir da raiz do projeto:
```bash
cd backend
```

Execute o comando do .NET para compilar e iniciar a API. 

* **Caso possua o .NET SDK configurado globalmente no PATH**:
  ```bash
  dotnet run
  ```

* **Caso possua o SDK do .NET instalado localmente (no perfil do usuário)**:
  ```powershell
  C:\Users\liahc\.dotnet\dotnet.exe run
  ```

A API iniciará no endereço: `http://localhost:5206`
*A documentação Swagger para testes rápidos de endpoints estará disponível em: `http://localhost:5206/swagger`*

---

### 2. Executando o Front-end (React)

Navegue até a pasta do front-end a partir da raiz do projeto:
```bash
cd frontend
```

Instale as dependências de pacotes:
```bash
npm install
```

Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

A aplicação React estará acessível em: `http://localhost:5173`

---

## 📝 Comentários e Lógica do Código

Toda a lógica e tomadas de decisões técnicas de banco de dados e regras de negócios estão amplamente documentadas diretamente nos arquivos de código fonte. 

Exemplos proeminentes de documentação interna podem ser vistos em:
- [PeopleController.cs](file:///c:/Liah/Nexvisual/Desafio_T%C3%A9cnico/backend/Controllers/PeopleController.cs) (Regra de exclusão cascade)
- [TransactionsController.cs](file:///c:/Liah/Nexvisual/Desafio_T%C3%A9cnico/backend/Controllers/TransactionsController.cs) (Regra de validação de idade)
- [AppDbContext.cs](file:///c:/Liah/Nexvisual/Desafio_T%C3%A9cnico/backend/Data/AppDbContext.cs) (Mapeamento do relacionamento cascade delete no EF Core)
- [App.tsx](file:///c:/Liah/Nexvisual/Desafio_T%C3%A9cnico/frontend/src/App.tsx) (Validação dinâmica de estado do tipo da transação com base na idade)
