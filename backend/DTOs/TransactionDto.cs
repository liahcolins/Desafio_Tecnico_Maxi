using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class CreateTransactionDto
    {
        [Required(ErrorMessage = "A descrição é obrigatória.")]
        [StringLength(200, ErrorMessage = "A descrição deve ter no máximo 200 caracteres.")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "O valor é obrigatório.")]
        [Range(0.01, 1000000000.00, ErrorMessage = "O valor deve ser maior que zero.")]
        public decimal Value { get; set; }

        [Required(ErrorMessage = "O tipo da transação é obrigatório.")]
        [RegularExpression("^(despesa|receita)$", ErrorMessage = "O tipo deve ser 'despesa' ou 'receita'.")]
        public string Type { get; set; } = string.Empty;

        [Required(ErrorMessage = "O identificador da pessoa é obrigatório.")]
        public Guid PersonId { get; set; }
    }
}
