const apiResponse = {
    certificateNumber: "203-22",
    student: {
        name: "LAURA SOFIA RAMIREZ POSSO",
        id: "1006290305",
    },
    degrees: [
        {
            grade: "Quinto",
            group: "1",
            year: "2014",
            note1: "2014-12-03",
            note2: null,
            subjects: [
                { subject: "Inglés", ih: 2, def: 2.9, valoracion: "Básico", nivelacion: "3.5 Bs" },
                { subject: "Emprendimiento", ih: 5, def: 3.7, valoracion: "Básico", nivelacion: "" },
                { subject: "Lengua Castellana", ih: 5, def: 3.7, valoracion: "Básico", nivelacion: "" },
                { subject: "Matemáticas", ih: 5, def: 3.5, valoracion: "Básico", nivelacion: "" },
                { subject: "Tecnología e Informática", ih: 3, def: 3.6, valoracion: "Básico", nivelacion: "" },
                { subject: "Educación Religiosa", ih: 2, def: 3.8, valoracion: "Básico", nivelacion: "" },
                { subject: "Educación Física", ih: 2, def: 3.9, valoracion: "Alto", nivelacion: "" },
                { subject: "Ciencias Sociales", ih: 4, def: 3.5, valoracion: "Básico", nivelacion: "" },
                { subject: "Disciplina y Comportamiento", ih: 1, def: 4.0, valoracion: "Superior", nivelacion: "" },
                { subject: "Educación Artística", ih: 2, def: 3.7, valoracion: "Básico", nivelacion: "" },
                { subject: "Educación Ética y Valores", ih: 2, def: 3.8, valoracion: "Básico", nivelacion: "" },
                { subject: "Ciencias Naturales y Educación Ambiental", ih: 4, def: 3.6, valoracion: "Básico", nivelacion: "" }
            ]
        },
        {
            grade: "Sexto",
            group: "1",
            year: "2016",
            note1: "2016-11-24",
            note2: "2017-01-31",
            subjects: [
                { subject: "Inglés", ih: 2, def: 2.8, valoracion: "Básico", nivelacion: "3.2 Bs" },
                { subject: "Educación Religiosa", ih: 2, def: 3.6, valoracion: "Básico", nivelacion: "" },
                { subject: "Lengua Castellana", ih: 5, def: 3.5, valoracion: "Básico", nivelacion: "" },
                { subject: "Matemáticas", ih: 5, def: 3.7, valoracion: "Básico", nivelacion: "" },
                { subject: "Tecnología e Informática", ih: 3, def: 3.4, valoracion: "Básico", nivelacion: "" },
                { subject: "Educación Física", ih: 2, def: 3.9, valoracion: "Alto", nivelacion: "" },
                { subject: "Educación Ética y Valores", ih: 2, def: 3.6, valoracion: "Básico", nivelacion: "" },
                { subject: "Ciencias Naturales y Educación Ambiental", ih: 4, def: 3.5, valoracion: "Básico", nivelacion: "" },
                { subject: "Ciencias Sociales", ih: 4, def: 3.6, valoracion: "Básico", nivelacion: "" },
                { subject: "Disciplina y Comportamiento", ih: 1, def: 3.8, valoracion: "Básico", nivelacion: "" },
                { subject: "Educación Artística", ih: 2, def: 3.7, valoracion: "Básico", nivelacion: "" },
                { subject: "Cátedra de la Paz", ih: 1, def: 3.9, valoracion: "Alto", nivelacion: "" }
            ]
        }
    ]
};


function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("es-CO", options);
}

function loadCertificate(data) {
    // Número de certificado
    document.querySelector(".certificate-number").textContent = `CERTIFICADO ${data.certificateNumber}`;

    // Info del estudiante
    const studentInfo = document.querySelector(".certificate-info");
    studentInfo.innerHTML = `
      Que: <strong>${data.student.name}</strong>, identificada con documento número
      <strong>${data.student.id}</strong>, cursó y aprobó en este establecimiento educativo,
      los estudios correspondientes a los grados <strong>${data.degrees.map(d => d.grade).join(" y ")}</strong>
      durante los periodos académicos <strong>${data.degrees.map(d => d.year).join(" y ")}</strong>.
      Conforme al Decreto 1290 del 11 Abril 2009.
    `;

    // Contenedor donde van los grados
    const mainContainer = document.querySelector(".main-container");
    mainContainer.innerHTML = ""; // limpiar contenido inicial

    data.degrees.forEach(degree => {
        const section = document.createElement("section");
        section.classList.add("degree-info");

        // Encabezado grado
        section.innerHTML = `
        <h3 class="degree-info-student">${data.student.name} Grado: ${degree.grade}, Grupo: ${degree.group}, Código Matricula</h3>
        <h3 class="degree-info-year">CONSOLIDADO DE CALIFICACIONES DEFINITIVAS DE PERIODO ACADÉMICO ${degree.year}</h3>
      `;

        // Crear tabla
        const table = document.createElement("table");
        table.classList.add("qualifications-table");
        table.innerHTML = `
        <thead>
          <tr>
            <th>Área / Asignatura</th>
            <th>IH</th>
            <th>DEF</th>
            <th>Valoración</th>
            <th>Nivelación</th>
          </tr>
        </thead>
        <tbody>
          ${degree.subjects.map(s => `
            <tr>
              <td>${s.subject}</td>
              <td style="text-align:center">${s.ih}</td>
              <td style="text-align:center">${s.def}</td>
              <td style="text-align:center">${s.valoracion}</td>
              <td style="text-align:center">${s.nivelacion || ""}</td>
            </tr>
          `).join("")}
        </tbody>
      `;

        section.appendChild(table);

        // Nota 1 (siempre existe)
        const note1 = document.createElement("p");
        note1.classList.add("note-1");
        note1.innerHTML = `<strong>NOTA:</strong> Realizó actividades de superación, según acta de fecha ${formatDate(degree.note1)}.`;
        section.appendChild(note1);

        // Nota 2 (opcional)
        if (degree.note2) {
            const note2 = document.createElement("p");
            note2.classList.add("note-2");
            note2.innerHTML = `<strong>NOTA:</strong> Realizó actividades pedagógicas de promoción anticipada, según acta de fecha ${formatDate(degree.note2)}.`;
            section.appendChild(note2);
        }

        mainContainer.appendChild(section);
    });

    // Fecha automática en zona horaria de Colombia
    const now = new Date();
    const formattedNow = now.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "America/Bogota"
    });
    document.querySelector(".details-date").textContent = `Roldanillo, ${formattedNow}.`;
}

// Simular llamada a la API
document.addEventListener("DOMContentLoaded", () => {
    loadCertificate(apiResponse);
});


// Botón para generar PDF
document.getElementById("printBtn").addEventListener("click", () => {
    const element = document.querySelector(".body-container");

    // Guardar el estilo original
    const originalBorder = element.style.border;

    // Quitar el borde para exportar
    element.style.border = "none";

    // Nombre del archivo dinámico
    const fileName = `certificado-academico-${apiResponse.certificateNumber}.pdf`;

    const options = {
        margin: 0,
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "cm", format: [21.6, 35.6], orientation: "portrait" } // Oficio
    };

    // Generar PDF
    html2pdf()
        .set(options)
        .from(element)
        .save()
        .then(() => {
            // Restaurar el borde después de exportar
            element.style.border = originalBorder;
        });
});