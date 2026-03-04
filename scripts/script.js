const numeroWhats = "5516999999999";
const senhaAdmin = "modelo123";

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

/* ===== BUSCAR ===== */

async function fetchServices(){
const { data, error } = await db
.from("services")
.select("*")
.order("id", { ascending: true });

if(error){
console.error(error);
return;
}

services = data;
renderServices();
renderAdmin();
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

document.addEventListener("DOMContentLoaded", ()=>{
fetchServices();

let sairBtn = document.createElement("button");
sairBtn.textContent = "Sair do Painel";
sairBtn.className = "btn";
sairBtn.style.marginTop="20px";
sairBtn.onclick = logoutAdmin;

document.getElementById("adminArea").appendChild(sairBtn);
});

document.getElementById("ano").textContent = new Date().getFullYear();