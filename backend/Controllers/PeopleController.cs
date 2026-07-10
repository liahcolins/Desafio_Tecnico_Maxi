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
    public class PeopleController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Injeção de dependência do contexto do banco de dados
        public PeopleController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtém a listagem de todas as pessoas cadastradas.
        /// </summary>
        /// <returns>Lista de pessoas.</returns>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // Busca todas as pessoas no banco de dados
            var people = await _context.People.ToListAsync();
            return Ok(people);
        }

        /// <summary>
        /// Cadastra uma nova pessoa no sistema.
        /// </summary>
        /// <param name="dto">Dados de criação da pessoa (Nome, Idade).</param>
        /// <returns>A pessoa criada com seu Identificador único gerado automaticamente.</returns>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePersonDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Criação da entidade e geração automática do Guid
            var person = new Person
            {
                Id = Guid.NewGuid(), // Gerado automaticamente
                Name = dto.Name,
                Age = dto.Age
            };

            _context.People.Add(person);
            await _context.SaveChangesAsync();

            // Retorna o objeto criado com o status 201 Created
            return CreatedAtAction(nameof(GetAll), new { id = person.Id }, person);
        }

        /// <summary>
        /// Exclui uma pessoa do sistema.
        /// REGRA DE NEGÓCIO: Ao excluir uma pessoa, todas as transações associadas a ela
        /// devem ser excluídas automaticamente (Exclusão em Cascata).
        /// </summary>
        /// <param name="id">Identificador único da pessoa.</param>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var person = await _context.People.FindAsync(id);
            if (person == null)
            {
                return NotFound(new { message = "Pessoa não encontrada." });
            }

            // A exclusão da pessoa aciona a deleção em cascata configurada no AppDbContext.
            // O SQLite removerá automaticamente todas as linhas correspondentes na tabela 'Transactions'
            // que possuem a chave estrangeira 'PersonId' correspondente a este 'id'.
            _context.People.Remove(person);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Pessoa e todas as suas transações foram excluídas com sucesso." });
        }
    }
}
