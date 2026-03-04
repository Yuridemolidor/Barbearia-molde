const numeroWhats = "5516999999999";
const senhaAdmin = "modelo123";

let horariosDisponiveis = [];
let diasBloqueados = [];

/* ================= SUPABASE CONFIG ================= */

const SUPABASE_URL = "https://lwtourrhfehhevpixzgf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3dG91cnJoZmVoaGV2cGl4emdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNjk5MjYsImV4cCI6MjA4Nzc0NTkyNn0.3yDpHC6TZ-nTHdRS6Oq1HNWsMVzyjdGLuEc--tt5aio";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ================= WHATS ================= */

function agendar(){
let msg="Olá, gostaria de agendar um horário na Barbearia Premium.";
window.open(`https://wa.me/${numeroWhats}?text=${encodeURIComponent(msg)}`,"_blank");
}

/* ================= ADMIN ================= */

function mostrarAdmin(){
let admin = document.querySelector(".admin");

if(admin.style.display === "block"){
admin.style.display = "none";
}else{
admin.style.display = "block";
window.scrollTo({top:admin.offsetTop - 80,behavior:"smooth"});
}
}

function loginAdmin(){
let senha = document.getElementById("adminSenha").value;

if(senha === senhaAdmin){
document.getElementById("loginArea").style.display="none";
document.getElementById("adminArea").style.display="block";
renderAdmin();
fetchAppointments();
}else{
alert("Senha incorreta!");
}
}

function logoutAdmin(){
document.getElementById("loginArea").style.display="block";
document.getElementById("adminArea").style.display="none";
document.getElementById("adminSenha").value="";
}

/* ================= SERVIÇOS ================= */

let services = [];
let editIndex = null;

/* ===== BUSCAR SERVIÇOS ===== */

async function fetchServices(){

const { data, error } = await db
.from("services")
.select("*")
.order("id", { ascending: true });

if(error){
console.error("Erro ao buscar serviços:", error);
return;
}

services = data;

renderServices();
renderAdmin();
carregarServicosSelect(); // 👈 agora integra com o agendamento
}
/* ===== RENDER FRONT ===== */

function renderServices(){
let container=document.getElementById("servicesContainer");
container.innerHTML="";

services.forEach((s)=>{
container.innerHTML+=`
<div class="card">
<h3>${s.name}</h3>
<p>${s.desc}</p>
<div class="price">${s.price}</div>
</div>`;
});
}

/* ===== RENDER ADMIN ===== */

function renderAdmin(){
let list=document.getElementById("adminList");
list.innerHTML="";

services.forEach((s,i)=>{
list.innerHTML+=`
<div class="admin-item">
<div>
<strong>${s.name}</strong><br>
<span style="color:#aaa;font-size:13px;">${s.price}</span>
</div>
<div>
<button onclick="editarServico(${i})" style="margin-right:10px;">✏</button>
<button onclick="excluirServico(${s.id})">🗑</button>
</div>
</div>`;
});
}

/* ===== SALVAR ===== */

async function salvarServico(){

let name=document.getElementById("serviceName").value;
let desc=document.getElementById("serviceDesc").value;
let price=document.getElementById("servicePrice").value;
let btn = document.querySelector("#adminArea .btn");

if(!name || !desc || !price){
alert("Preencha todos os campos!");
return;
}

if(editIndex===null){

const { error } = await db
.from("services")
.insert([{ name, desc, price }]);

if(error){
console.error(error);
return;
}

alert("Serviço adicionado com sucesso!");

}else{

let id = services[editIndex].id;

const { error } = await db
.from("services")
.update({ name, desc, price })
.eq("id", id);

if(error){
console.error(error);
return;
}

alert("Serviço atualizado com sucesso!");
editIndex=null;
btn.textContent="Salvar Serviço";
}

limparCampos();
fetchServices();
}

/* ===== EDITAR ===== */

function editarServico(i){
let s=services[i];
document.getElementById("serviceName").value=s.name;
document.getElementById("serviceDesc").value=s.desc;
document.getElementById("servicePrice").value=s.price;
editIndex=i;

document.querySelector("#adminArea .btn").textContent="Atualizar Serviço";
}

/* ===== EXCLUIR ===== */

async function excluirServico(id){

if(confirm("Deseja excluir este serviço?")){

const { error } = await db
.from("services")
.delete()
.eq("id", id);

if(error){
console.error(error);
return;
}

fetchServices();
}
}

function limparCampos(){
document.getElementById("serviceName").value="";
document.getElementById("serviceDesc").value="";
document.getElementById("servicePrice").value="";
}

/* INIT */

document.addEventListener("DOMContentLoaded", async ()=>{

await fetchServices();
await fetchHorarios();
await fetchDiasBloqueados();
await fetchAppointmentsBarbeiro();

let sairBtn = document.createElement("button");
sairBtn.textContent = "Sair do Painel";
sairBtn.className = "btn";
sairBtn.style.marginTop="20px";
sairBtn.onclick = logoutAdmin;

document.getElementById("adminArea").appendChild(sairBtn);

});
document.getElementById("ano").textContent = new Date().getFullYear();

/* ================= AGENDAMENTO ================= */

/* ================= HORÁRIOS DINÂMICOS ================= */

// Horários disponíveis
async function fetchHorarios() {
    const { data, error } = await db
        .from("available_hours")
        .select("*")
        .order("hour", { ascending: true });

    if(error){
        console.error("Erro ao buscar horários:", error);
        return;
    }

    horariosDisponiveis = data.map(h => h.hour);
    renderHorariosAdmin();
}

// Dias bloqueados
async function fetchDiasBloqueados() {
    const { data, error } = await db
        .from("blocked_days")
        .select("*");

    if(error){
        console.error(error);
        return;
    }

    diasBloqueados = data.map(d => d.date);
    renderDiasBloqueados();
}

/* Mostrar horários no painel admin */
function renderHorariosAdmin(){

let container = document.getElementById("listaHorarios");
if(!container) return;

container.innerHTML = "";

horariosDisponiveis.forEach(h=>{
container.innerHTML += `
<div style="display:flex;justify-content:space-between;
background:#111;padding:8px;margin-bottom:5px;border-radius:5px;">
<span>${h}</span>
<button onclick="removerHorario('${h}')">🗑</button>
</div>
`;
});
}

/* ===== BUSCAR AGENDAMENTOS ===== */

async function fetchAppointments(){
    const { data, error } = await db
        .from("appointments")
        .select(`
            id,
            name,
            phone,
            date,
            time,
            service ( name )
        `)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

    if(error){
        console.error("Erro ao buscar agendamentos:", error);
        return;
    }

    renderAppointments(data);
}
/* ===== RENDER TABELA ===== */

function renderAppointments(lista){

let container = document.getElementById("appointmentsTable");
if(!container) return;

container.innerHTML = `
<table style="width:100%;border-collapse:collapse;margin-top:20px;">
<thead>
<tr style="background:#111;">
<th>Data</th>
<th>Horário</th>
<th>Cliente</th>
<th>Telefone</th>
<th>Serviço</th>
<th></th>
</tr>
</thead>
<tbody>
${lista.map(a=>`
<tr style="text-align:center;border-bottom:1px solid #333;">
<td>${a.date}</td>
<td>${a.time}</td>
<td>${a.name}</td>
<td>${a.phone}</td>
<td>${a.service?.name || ""}</td>
<td>
<button onclick="cancelarAgendamento(${a.id})">❌</button>
</td>
</tr>
`).join("")}
</tbody>
</table>
`;
}

/* ===== CANCELAR ===== */

async function cancelarAgendamento(id){

if(!confirm("Deseja cancelar este agendamento?")) return;

await db
.from("appointments")
.delete()
.eq("id", id);

fetchAppointments();
}

/* Adicionar novo horário */
async function adicionarHorario(){

let input = document.getElementById("novoHorario");
let hour = input.value;

if(!hour){
alert("Selecione um horário!");
return;
}

const { error } = await db
.from("available_hours")
.insert([{ hour }]);

if(error){
console.error(error);
alert("Erro ao adicionar horário");
return;
}

input.value = "";
fetchHorarios();
}

/* Remover horário */
async function removerHorario(hour){

const { error } = await db
.from("available_hours")
.delete()
.eq("hour", hour);

if(error){
console.error(error);
return;
}

fetchHorarios();
}

/* ===== CARREGAR SERVIÇOS NO SELECT ===== */

function carregarServicosSelect(){

let select = document.getElementById("servicoSelect");
if(!select) return;

select.innerHTML = "<option value=''>Selecione um serviço</option>";

services.forEach(s=>{
select.innerHTML += `
<option value="${s.id}">
${s.name} - ${s.price}
</option>`;
});
}

/* ===== CARREGAR HORÁRIOS DISPONÍVEIS ===== */

async function carregarHorarios() {
    let dataSelecionada = document.getElementById("dataSelect").value;
    let select = document.getElementById("horarioSelect");

    const formatarData = d => new Date(d).toISOString().split('T')[0];

    if(!dataSelecionada) {
        select.innerHTML = "<option value=''>Selecione uma data primeiro</option>";
        return;
    }

    if(diasBloqueados.map(formatarData).includes(formatarData(dataSelecionada))) {
        select.innerHTML = "<option value=''>Barbearia fechada neste dia</option>";
        return;
    }

    // Buscar horários ocupados
    const { data: agendamentos } = await db
        .from("appointments")
        .select("time")
        .eq("date", dataSelecionada);

    let ocupados = agendamentos ? agendamentos.map(a => a.time) : [];

    // Preencher select com horários disponíveis
    select.innerHTML = "";
    let count = 0;
    horariosDisponiveis.forEach(h => {
        if(!ocupados.includes(h)){
            select.innerHTML += `<option value="${h}">${h}</option>`;
            count++;
        }
    });

    if(count === 0){
        select.innerHTML = "<option value=''>Sem horários disponíveis</option>";
    } else {
        select.selectedIndex = 0; // seleciona primeiro horário disponível
    }
}

/* ===== CONFIRMAR AGENDAMENTO ===== */

async function confirmarAgendamento(){
    let nome = document.getElementById("clienteNome").value;
    let telefone = document.getElementById("clienteTelefone").value;
    let service_id = parseInt(document.getElementById("servicoSelect").value);
    let date = document.getElementById("dataSelect").value;
    let time = document.getElementById("horarioSelect").value;

    if(!nome || !telefone || !service_id || !date || !time){
        alert("Preencha todos os campos!");
        return;
    }

    const { error } = await db
        .from("appointments")
        .insert([{ 
            name: nome, 
            phone: telefone, 
            service_id: service_id, 
            date: date, 
            time: time 
        }]);

    if(error){
    alert("Erro ao agendar: " + error.message);
    console.error("Erro completo:", error);
    return;
}

    alert("Agendamento confirmado com sucesso! 🎉");

    // Limpar campos
    document.getElementById("clienteNome").value = "";
    document.getElementById("clienteTelefone").value = "";
    document.getElementById("servicoSelect").value = "";
    document.getElementById("dataSelect").value = "";
    document.getElementById("horarioSelect").innerHTML =
        "<option value=''>Selecione uma data primeiro</option>";
}

// Buscar agendamentos para o barbeiro (todos)
async function fetchAppointmentsBarbeiro() {
    const { data, error } = await db
        .from("appointments")
        .select(`
            id,
            name,
            phone,
            date,
            time,
            service ( name )
        `)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

    if(error){
        console.error("Erro ao buscar agendamentos para barbeiro:", error);
        return;
    }

    renderAppointmentsBarbeiro(data);
}

// Renderizar na tabela do barbeiro
function renderAppointmentsBarbeiro(lista) {
    const container = document.querySelector("#barbeiroTable tbody");
    if(!container) return;

    container.innerHTML = lista.map(a => `
        <tr style="text-align:center;border-bottom:1px solid #333;">
            <td>${a.date}</td>
            <td>${a.time}</td>
            <td>${a.name}</td>
            <td>${a.phone}</td>
            <td>${a.service?.name || ""}</td>
        </tr>
    `).join("");
}

async function bloquearDia(){

let data = document.getElementById("diaBloqueado").value;
if(!data){
alert("Selecione um dia!");
return;
}

const { error } = await db
.from("blocked_days")
.insert([{ date: data }]);

if(error){
console.error(error);
return;
}

document.getElementById("diaBloqueado").value="";
fetchDiasBloqueados();
renderDiasBloqueados();
}


function renderDiasBloqueados(){

let container = document.getElementById("listaDiasBloqueados");
container.innerHTML="";

diasBloqueados.forEach(d=>{
container.innerHTML+=`
<div style="display:flex;justify-content:space-between;
background:#111;padding:8px;margin-bottom:5px;border-radius:5px;">
<span>${new Date(d).toLocaleDateString('pt-BR')}</span>
<button onclick="removerDia('${d}')">🗑</button>
</div>
`;
});
}


async function removerDia(data){

await db
.from("blocked_days")
.delete()
.eq("date", data);

fetchDiasBloqueados();
renderDiasBloqueados();
}

/* ===== EVENTO AO MUDAR DATA ===== */

document.addEventListener("change", function(e){
if(e.target && e.target.id === "dataSelect"){
carregarHorarios();
}
});