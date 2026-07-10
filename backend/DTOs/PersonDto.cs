using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class CreatePersonDto
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        [StringLength(100, ErrorMessage = "O nome deve ter no máximo 100 caracteres.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "A idade é obrigatória.")]
        [Range(0, 150, ErrorMessage = "A idade deve ser entre 0 e 150 anos.")]
        public int Age { get; set; }
    }
}
