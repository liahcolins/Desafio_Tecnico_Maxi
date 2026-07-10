using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Injeção de dependência do contexto do banco de dados
        public TransactionsController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtém a listagem de todas as transações cadastradas, incluindo as informações da pessoa vinculada.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // O uso de .Include(t => t.Person) busca os dados da pessoa associada por junção (join) no banco
            var transactions = await _context.Transactions
                .Include(t => t.Person)
                .ToListAsync();

            return Ok(transactions);
        }

        /// <summary>
        /// Cadastra uma nova transação financeira.
        /// REGRA DE NEGÓCIO: Valida se a pessoa existe e se é menor de idade (menor de 18 anos).
        /// Se for menor de idade, apenas despesas podem ser cadastradas.
        /// </summary>
        /// <param name="dto">Dados de criação da transação.</param>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTransactionDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // REGRA 1: Validar se a pessoa informada existe no banco de dados.
            var person = await _context.People.FindAsync(dto.PersonId);
            if (person == null)
            {
                // Conforme especificação: "Esse valor precisa existir no cadastro de pessoa"
                return BadRequest(new { message = "A pessoa informada não existe no cadastro." });
            }

            // REGRA 2: Validar se a pessoa é menor de idade (menor que 18 anos).
            // Caso seja menor de idade, somente transações do tipo "despesa" podem ser cadastradas.
            if (person.Age < 18 && dto.Type.Equals("receita", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { 
                    message = $"A pessoa '{person.Name}' é menor de idade ({person.Age} anos) e só pode ter despesas cadastradas." 
                });
            }

            // Criação da transação
            var transaction = new Transaction
            {
                Id = Guid.NewGuid(), // Gerado automaticamente
                Description = dto.Description,
                Value = dto.Value,
                Type = dto.Type.ToLower(), // Normaliza para minúsculo
                PersonId = dto.PersonId
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            // Recarrega os dados da pessoa para retornar o objeto completo na resposta
            transaction.Person = person;

            return CreatedAtAction(nameof(GetAll), new { id = transaction.Id }, transaction);
        }
    }
}
