using System;
using System.Collections.Generic;

namespace backend.DTOs
{
    /// <summary>
    /// Totais individuais de uma pessoa.
    /// </summary>
    public class PersonTotalDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Age { get; set; }
        public decimal TotalRevenue { get; set; } // Total de Receitas
        public decimal TotalExpenses { get; set; } // Total de Despesas
        public decimal Balance { get; set; } // Saldo (Receitas - Despesas)
    }

    /// <summary>
    /// Relatório consolidado com totais individuais e totais gerais.
    /// </summary>
    public class TotalsReportDto
    {
        public List<PersonTotalDto> People { get; set; } = new List<PersonTotalDto>();
        public decimal GrandTotalRevenue { get; set; } // Total geral de Receitas
        public decimal GrandTotalExpenses { get; set; } // Total geral de Despesas
        public decimal GrandNetBalance { get; set; } // Saldo líquido geral (Receitas - Despesas)
    }
}
