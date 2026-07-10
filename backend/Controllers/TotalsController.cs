using backend.Data;
using backend.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TotalsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TotalsController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtém o relatório consolidado de totais de gastos residenciais.
        /// Retorna a lista de pessoas com seus totais de receitas, despesas e saldo individual,
        /// além dos totais consolidados de todo o sistema.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetTotalsReport()
        {
            // Busca todas as pessoas incluindo suas respectivas transações cadastrais
            var peopleWithTransactions = await _context.People
                .Include(p => p.Transactions)
                .ToListAsync();

            // Monta os totais individuais de cada pessoa
            var peopleTotals = peopleWithTransactions.Select(person =>
            {
                var totalRevenue = person.Transactions
                    .Where(t => t.Type.Equals("receita", System.StringComparison.OrdinalIgnoreCase))
                    .Sum(t => t.Value);

                var totalExpenses = person.Transactions
                    .Where(t => t.Type.Equals("despesa", System.StringComparison.OrdinalIgnoreCase))
                    .Sum(t => t.Value);

                return new PersonTotalDto
                {
                    Id = person.Id,
                    Name = person.Name,
                    Age = person.Age,
                    TotalRevenue = totalRevenue,
                    TotalExpenses = totalExpenses,
                    Balance = totalRevenue - totalExpenses
                };
            }).ToList();

            // Calcula os totais gerais somando os valores de todas as pessoas
            var grandTotalRevenue = peopleTotals.Sum(p => p.TotalRevenue);
            var grandTotalExpenses = peopleTotals.Sum(p => p.TotalExpenses);
            var grandNetBalance = grandTotalRevenue - grandTotalExpenses;

            // Instancia o DTO de relatório consolidado
            var report = new TotalsReportDto
            {
                People = peopleTotals,
                GrandTotalRevenue = grandTotalRevenue,
                GrandTotalExpenses = grandTotalExpenses,
                GrandNetBalance = grandNetBalance
            };

            return Ok(report);
        }
    }
}
