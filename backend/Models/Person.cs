using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace backend.Models
{
    /// <summary>
    /// Representa uma pessoa cadastrada no sistema.
    /// </summary>
    public class Person
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required(ErrorMessage = "O nome é obrigatório.")]
        [StringLength(100, ErrorMessage = "O nome deve ter no máximo 100 caracteres.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "A idade é obrigatória.")]
        [Range(0, 150, ErrorMessage = "A idade deve ser entre 0 e 150 anos.")]
        public int Age { get; set; }

        /// <summary>
        /// Coleção de transações associadas a esta pessoa.
        /// A configuração do EF Core gerará deleção em cascata (Cascade Delete) por padrão.
        /// </summary>
        [JsonIgnore] // Impede referência circular ao serializar
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}
