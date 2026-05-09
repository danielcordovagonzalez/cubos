let html5QrCode = null;
let camaraIniciada = false;
let historialQR = []; // Aquí se guardan todos los QR
let ultimoQRLeido = ""; // Pa' no guardar el mismo QR repetido

function iniciarEscaneo() {
    if (camaraIniciada) {
        alert("La cámara ya está prendida mor");
        return;
    }

    html5QrCode = new Html5Qrcode("lector-qr");
    
    const config = { 
        fps: 10, 
        qrbox: { width: 180, height: 180 },
        aspectRatio: 1.333,
        // Pa' que no se detenga solo
        disableFlip: false
    };

    html5QrCode.start(
        { facingMode: "environment" }, 
        config,
        (decodedText, decodedResult) => {
            // Si el QR es diferente al último que leyó, lo guarda
            if (decodedText !== ultimoQRLeido) {
                ultimoQRLeido = decodedText;
                guardarQR(decodedText);
                
                // Sonido de "beep" cuando lee uno nuevo
                new Audio('https://www.soundjay.com/buttons/beep-07a.mp3').play();
            }
        },
        (errorMessage) => {
            // Ignora cuando no hay QR
        }
    ).then(() => {
        camaraIniciada = true;
        document.getElementById('resultado').innerText = "Escaneando...";
    }).catch((err) => {
        alert('Error al iniciar cámara: ' + err);
    });
}

function guardarQR(texto) {
    // 1. Guarda en el array
    const hora = new Date().toLocaleTimeString();
    historialQR.push({ texto: texto, hora: hora });
    
    // 2. Muestra el último en pantalla
    document.getElementById('resultado').innerText = texto;
    
    // 3. Agrega una fila a la tabla
    const tabla = document.getElementById('cuerpo-tabla');
    const nuevaFila = tabla.insertRow(0); // insertRow(0) lo pone de primero
    
    nuevaFila.innerHTML = `
        <td>${historialQR.length}</td>
        <td>${texto}</td>
        <td>${hora}</td>
    `;

    // 4. Guarda en localStorage pa' que no se borre si recargas
    localStorage.setItem('historialQR', JSON.stringify(historialQR));
    
    console.log("QR guardado:", texto);
}

function detenerEscaneo() {
    if (html5QrCode && camaraIniciada) {
        html5QrCode.stop().then(() => {
            document.getElementById('lector-qr').innerHTML = "";
            document.getElementById('resultado').innerText = "Cámara detenida";
            camaraIniciada = false;
            ultimoQRLeido = ""; // Resetea pa' que pueda leer el mismo QR otra vez
        }).catch(err => {
            console.log("Error al detener", err);
        });
    }
}

function limpiarHistorial() {
    historialQR = [];
    document.getElementById('cuerpo-tabla').innerHTML = "";
    localStorage.removeItem('historialQR');
    document.getElementById('resultado').innerText = "Historial limpio";
}

// Cuando carga la página, revisa si había historial guardado
window.onload = () => {
    const historialGuardado = localStorage.getItem('historialQR');
    if (historialGuardado) {
        historialQR = JSON.parse(historialGuardado);
        // Vuelve a pintar la tabla
        const tabla = document.getElementById('cuerpo-tabla');
        historialQR.forEach((item, index) => {
            const nuevaFila = tabla.insertRow();
            nuevaFila.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.texto}</td>
                <td>${item.hora}</td>
            `;
        });
    }
};