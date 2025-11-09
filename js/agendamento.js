// Configuração
const SERVICE_PRICE = 50;
const BUSINESS_NAME = 'Studio Nails';
const WHATS_PHONE = '5513997106377'; // Número da Giovanna
const STORAGE_KEY = 'studioNailsBookingsV1';

// Lista de todos os horários disponíveis
const ALL_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00',
  '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

// Duração do serviço em minutos
const SERVICE_DURATION = 150; // 2 horas e 30 minutos

// Gera slots de 30min entre 09:00 e 18:00
function generateSlots() {
  return ALL_SLOTS;
}

function getTodayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

// Estado
let bookings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

// DOM
const form = document.getElementById('bookingForm');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('time');
const messageInput = document.getElementById('message');
const slotsEl = document.getElementById('slots');
const bookingsList = document.getElementById('bookingsList');
const whatsLink = document.getElementById('whatsLink');
const yearEl = document.getElementById('year');

// Inicialização
(function init() {
  yearEl.textContent = new Date().getFullYear();
  dateInput.min = getTodayISO();
  populateTimeOptions();
  renderSlots();
  renderBookings();
  updateWhatsLink();
})();

function updateWhatsLink() {
  if (!WHATS_PHONE) {
    whatsLink.style.display = 'none';
    return;
  }
  const msg = encodeURIComponent(`Olá, gostaria de informações sobre agendamento no ${BUSINESS_NAME}.`);
  whatsLink.href = `https://wa.me/${WHATS_PHONE}?text=${msg}`;
}

function populateTimeOptions() {
  const slots = generateSlots();
  timeSelect.innerHTML = '<option value="">Selecione um horário</option>' +
    slots.map(s => `<option value="${s}">${s}</option>`).join('');
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

// Modifica a função isSlotBooked para verificar conflitos de horário
function isSlotBooked(date, time) {
  // Converte o horário selecionado para minutos desde o início do dia
  const selectedTimeInMinutes = convertTimeToMinutes(time);
  
  return bookings.some(booking => {
    if (booking.date !== date) return false;
    
    const bookedTimeInMinutes = convertTimeToMinutes(booking.time);
    
    // Verifica se o horário selecionado está dentro do período de algum agendamento existente
    // ou se algum agendamento existente afetaria o horário selecionado
    return (selectedTimeInMinutes >= bookedTimeInMinutes && 
            selectedTimeInMinutes < bookedTimeInMinutes + SERVICE_DURATION) ||
           (selectedTimeInMinutes + SERVICE_DURATION > bookedTimeInMinutes && 
            selectedTimeInMinutes <= bookedTimeInMinutes + SERVICE_DURATION);
  });
}

// Função auxiliar para converter horário em minutos
function convertTimeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function handleSubmit(e) {
  e.preventDefault();
  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const date = dateInput.value;
  const time = timeSelect.value;
  const message = messageInput.value.trim();

  if (!name || !phone || !date || !time) {
    toast('Preencha todos os campos obrigatórios.', 'danger');
    return;
  }
  if (!isValidPhone(phone)) {
    toast('Telefone inválido. Informe um número com DDD.', 'danger');
    return;
  }
  if (isSlotBooked(date, time)) {
    toast('Horário indisponível. Escolha outro.', 'danger');
    return;
  }

  const booking = {
    id: Date.now(),
    name, phone, date, time, message,
    price: SERVICE_PRICE,
    createdAt: new Date().toISOString(),
  };

  // Salva o agendamento
  bookings.push(booking);
  save();

  // Formata e envia para o WhatsApp
  const whatsappMessage = formatWhatsAppMessage(booking);
  const whatsappUrl = `https://wa.me/${WHATS_PHONE}?text=${whatsappMessage}`;


  // Limpa o formulário e atualiza a interface
  form.reset();
  renderSlots();
  renderBookings();
  toast('Agendamento confirmado! Redirecionando para o WhatsApp...', 'success');

  // Abre o WhatsApp em uma nova aba
  window.open(whatsappUrl, '_blank');
}

// Atualiza a função renderSlots para mostrar os slots ocupados
function renderSlots() {
  const date = dateInput.value || getTodayISO();
  const slots = generateSlots();
  const html = slots.map(s => {
    const booked = isSlotBooked(date, s);
    return `<button type="button" class="slot ${booked ? 'booked' : 'available'}" 
            data-time="${s}" ${booked ? 'disabled' : ''}>${s}</button>`;
  }).join('');
  slotsEl.innerHTML = html;

  // interação: clicar no slot define o select
  Array.from(slotsEl.querySelectorAll('.slot.available')).forEach(btn => {
    btn.addEventListener('click', () => {
      timeSelect.value = btn.dataset.time;
      smoothScrollTo(form);
    });
  });
}

function checkBookingOwnership(booking) {
  const phoneInput = prompt(`Para ver as opções do seu agendamento, digite o número de telefone usado:`);
  if (!phoneInput) return false;
  
  const cleanPhone = phoneInput.replace(/\D/g, '');
  const bookingPhone = booking.phone.replace(/\D/g, '');
  
  return cleanPhone === bookingPhone;
}

function renderBookings() {
  if (!bookings.length) {
    bookingsList.innerHTML = '<p class="muted">Nenhum agendamento ainda.</p>';
    return;
  }
  const sorted = [...bookings].sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
  bookingsList.innerHTML = sorted.map(b => bookingItemTemplate(b)).join('');

  // bind actions
  Array.from(bookingsList.querySelectorAll('[data-action="verify"]')).forEach(btn => {
    btn.addEventListener('click', () => {
      const booking = bookings.find(b => b.id === Number(btn.dataset.id));
      if (booking && checkBookingOwnership(booking)) {
        // Só mostra o botão de excluir após verificar o telefone
        btn.className = 'btn btn-danger';
        btn.textContent = 'Excluir';
        btn.dataset.action = 'delete';
        btn.addEventListener('click', () => deleteBooking(btn.dataset.id));
      } else {
        toast('Número de telefone incorreto.', 'danger');
      }
    });
  });
}

function bookingItemTemplate(b) {
  const dateBR = formatDateBR(b.date);
  return `
    <div class="booking-item">
      <div class="booking-info">
        <h4>${b.name}</h4>
        <p><span class="tag">${dateBR} • ${b.time}</span> • <span class="tag">R$ ${b.price.toFixed(2)}</span></p>
        ${b.message ? `<p class="muted">${escapeHTML(b.message)}</p>` : ''}
      </div>
      <div class="booking-actions">
        <button class="btn btn-ghost" data-action="verify" data-id="${b.id}">Ver opções</button>
      </div>
    </div>
  `;
}

function deleteBooking(id) {
  const numId = Number(id);
  const booking = bookings.find(x => x.id === numId);
  
  if (!booking) return;

  if (!confirm(`Confirma a exclusão do agendamento de ${booking.name} em ${formatDateBR(booking.date)} às ${booking.time}?`)) {
    return;
  }

  bookings = bookings.filter(x => x.id !== numId);
  save();
  toast('Agendamento excluído.', 'success');
  renderSlots();
  renderBookings();
}

function formatWhatsAppMessage(booking) {
  const message = `Olá! Gostaria de confirmar um horário:
  
📅 Data: ${booking.date}
⏰ Horário: ${booking.time}
👤 Nome: ${booking.name}
📞 Telefone: ${booking.phone}
${booking.message ? `📝 Observações: ${booking.message}` : ''}

Aguardo confirmação!`;

  return encodeURIComponent(message);
}

// No evento de submit do formulário
bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const booking = {
    name: nameInput.value,
    phone: phoneInput.value,
    date: dateInput.value,
    time: timeInput.value,
    message: messageInput.value
  };

  // Salva o agendamento
  saveBooking(booking);
  
  // Formata a mensagem e redireciona para o WhatsApp
  const whatsappMessage = formatWhatsAppMessage(booking);
  const whatsappUrl = `https://wa.me/5513997106377?text=${whatsappMessage}`;
  
  // Redireciona para o WhatsApp após salvar
  window.open(whatsappUrl, '_blank');

  // Limpa o formulário e atualiza a interface
  bookingForm.reset();
  updateSlots();
  displayBookings();
  
  alert('Agendamento confirmado! Você será redirecionado para o WhatsApp.');
});

// Helpers
function formatDateBR(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function escapeHTML(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 2500);
}

function smoothScrollTo(target) {
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Eventos
form.addEventListener('submit', handleSubmit);

dateInput.addEventListener('change', () => {
  renderSlots();
});

// Sincroniza múltiplas abas
setInterval(() => {
  const latest = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  if (JSON.stringify(latest) !== JSON.stringify(bookings)) {
    bookings = latest;
    renderSlots();
    renderBookings();
  }
}, 5000);
