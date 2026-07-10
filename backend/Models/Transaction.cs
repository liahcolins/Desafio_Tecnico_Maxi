using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    /// <summary>
    /// Representa uma transação financeira (Receita ou Despesa).
    /// </summary>
    public class Transaction
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required(ErrorMessage = "A descrição é obrigatória.")]
        [StringLength(200, ErrorMessage = "A descrição deve ter no máximo 200 caracteres.")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "O valor é obrigatório.")]
        [Range(0.01, 1000000000.00, ErrorMessage = "O valor deve ser maior que zero.")]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Value { get; set; }

        /// <summary>
        /// Tipo da transação: "despesa" ou "receita".
        /// </summary>
        [Required(ErrorMessage = "O tipo da transação é obrigatório.")]
        [RegularExpression("^(despesa|receita)$", ErrorMessage = "O tipo deve ser 'despesa' ou 'receita'.")]
        public string Type { get; set; } = string.Empty;

        [Required(ErrorMessage = "O identificador da pessoa é obrigatório.")]
        public Guid PersonId { get; set; }

        /// <summary>
        /// Pessoa associada a esta transação.
        /// </summary>
        [ForeignKey("PersonId")]
        public Person? Person { get; set; }
    }
}
