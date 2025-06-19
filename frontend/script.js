async function saludar() {
    const respuesta = await fetch("http://localhost:7860/");
    const datos = await respuesta.json();
    document.getElementById("respuesta").textContent = JSON.stringify(datos, null, 2);
}
