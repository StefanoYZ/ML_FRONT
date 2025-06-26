function crearRadios(nombreCampo) {
    const contenedor = document.querySelector(`.radio-group[data-name='${nombreCampo}']`);
    for (let i = 0; i <= 5; i++) {
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = nombreCampo;
        radio.value = i;
        radio.required = true;

        const label = document.createElement("label");
        const span = document.createElement("span");
        span.textContent = i;
        label.appendChild(radio);
        label.appendChild(span);

        contenedor.appendChild(label);
    }
}


// Campos tipo escala
const escalas = [
    "Academic Pressure",
    "Work Pressure",
    "Study Satisfaction",
    "Job Satisfaction",
    "Financial Stress"
];
escalas.forEach(crearRadios);

// Maneja el consentimiento
const consentimiento = document.getElementById("consentimiento");
const botonEnviar = document.getElementById("submit-button");

consentimiento.addEventListener("change", () => {
    botonEnviar.disabled = !consentimiento.checked;
});

// Manejo del formulario
document.getElementById("predict-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const jsonData = Object.fromEntries(formData.entries());

    // Transformar CGPA base 20 → base 10
    if (jsonData["CGPA"]) {
        jsonData["CGPA"] = (parseFloat(jsonData["CGPA"]) / 2).toFixed(2);
    }

    try {
                // Invertir Job Satisfaction
        if (jsonData["Job Satisfaction"]) {
            jsonData["Job Satisfaction"] = 6 - parseInt(jsonData["Job Satisfaction"]);
        }
        if (jsonData["Work Pressure"]){
            jsonData["Work Pressure"]=6 - parseInt(jsonData["Work Pressure"] );
        }
        //http://127.0.0.1:5000 para local 
        //https://api-ml-m9js.onrender.com/predict para remoto
        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jsonData)
        });

        const resultadoDiv = document.getElementById("resultado");
        if (response.ok) {
            const data = await response.json();
            let resultadoHTML = `
            <div class="result-box">
              <p><strong>¿Tiene depresión?</strong> ${data.tiene_depresion ? 'Sí' : 'No'}</p>
              <p><strong>Probabilidad:</strong> ${(data.probabilidad * 100).toFixed(2)}%</p>
          `;
          
          if (data.tiene_depresion) {
            resultadoHTML += `
              <button onclick="location.href='consejos.html'" class="start-button" style="margin-top: 1rem;">
                Ver Consejos
              </button>
            `;
          }
          
          resultadoHTML += '</div>';
          resultadoDiv.innerHTML = resultadoHTML;
          
        } else {
            const error = await response.json();
            resultadoDiv.innerHTML = `<p class="error">Error: ${error.error}</p>`;
        }
    } catch (error) {
        document.getElementById("resultado").innerHTML = `<p class="error">Error al conectar con el servidor</p>`;
    }
});
