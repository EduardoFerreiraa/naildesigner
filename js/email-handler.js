// EmailJS configuration
(function() {
    // Carrega o script do EmailJS
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    document.head.appendChild(script);
    
    script.onload = function() {
        // Inicializa o EmailJS com seu ID de usuário (você precisará se cadastrar em emailjs.com)
        emailjs.init("YOUR_USER_ID"); // Substitua "YOUR_USER_ID" pelo seu ID após se cadastrar
    };
})();

// Função para enviar o formulário de contato
function enviarFormularioContato(e) {
    e.preventDefault();
    
    const nome = document.getElementById('contato-nome').value;
    const email = document.getElementById('contato-email').value;
    const assunto = document.getElementById('contato-assunto').value;
    const mensagem = document.getElementById('contato-mensagem').value;
    
    // Parâmetros para o template de email
    const templateParams = {
        to_email: 'giovannaaraujobonifacio07@gmail.com',
        from_name: nome,
        from_email: email,
        subject: assunto,
        message: mensagem
    };
    
    // Mostra um indicador de carregamento
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    
    // Envia o email usando EmailJS
    emailjs.send('default_service', 'template_contato', templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            alert('Mensagem enviada com sucesso! Responderemos em breve.');
            document.getElementById('form-contato').reset();
        }, function(error) {
            console.log('FAILED...', error);
            alert('Erro ao enviar mensagem. Por favor, tente novamente ou entre em contato pelo WhatsApp.');
        })
        .finally(function() {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

// Função para enviar o formulário de agendamento
function enviarFormularioAgendamento(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const servico = document.getElementById('servico').value;
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    
    // Formata a data para exibição
    const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
    
    // Parâmetros para o template de email
    const templateParams = {
        to_email: 'giovannaaraujobonifacio07@gmail.com',
        from_name: nome,
        telefone: telefone,
        servico: servico,
        data: dataFormatada,
        horario: horario,
        message: `Solicitação de agendamento para ${servico} no dia ${dataFormatada} às ${horario}.`
    };
    
    // Mostra um indicador de carregamento
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    
    // Envia o email usando EmailJS
    emailjs.send('default_service', 'template_agendamento', templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            alert('Solicitação de agendamento enviada com sucesso! Entraremos em contato para confirmar.');
            document.getElementById('form-agenda').reset();
        }, function(error) {
            console.log('FAILED...', error);
            alert('Erro ao enviar solicitação. Por favor, tente novamente ou agende pelo WhatsApp.');
        })
        .finally(function() {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

// Adiciona os event listeners quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    const formAgenda = document.getElementById('form-agenda');
    const formContato = document.getElementById('form-contato');
    
    if (formAgenda) {
        formAgenda.addEventListener('submit', enviarFormularioAgendamento);
    }
    
    if (formContato) {
        formContato.addEventListener('submit', enviarFormularioContato);
    }
});