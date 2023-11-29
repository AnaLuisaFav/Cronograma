function setSelectColorTheme(target, value) {
    if (value === 'Não Iniciado') {
        target.style.color = 'rgb(101 25 23)';
        target.style.backgroundColor = 'rgb(247 210 210 / 83%)';
        return;
    }
    if (value === 'Em Progresso') {
        target.style.color = 'rgb(127 101 41)';
        target.style.backgroundColor = 'rgb(251 235 198)';
        return;
    }
    if (value === 'Concluído') {
        target.style.color = '#043932';
        target.style.backgroundColor = 'rgb(197 231 219)';
        return;
    }
    saveDataToLocalStorage();
}

function construirLinha(rowData) {
    var table = document.getElementById("table");
    var newRow = table.insertRow(-1);
    newRow.insertCell(0).innerHTML = '<input type="text" value="' + rowData.tema + '" disabled>';
    newRow.insertCell(1).className = "duration";
    newRow.cells[1].innerHTML = `
        <div class="clock-icon"></div>
        <input type="text" class="tempoInput" value="${rowData.tempo}" step="1" disabled>
    `;
    
    newRow.insertCell(2).innerHTML = `
        <select>
            <option value="Não Iniciado">Não Iniciado</option>
            <option value="Em Progresso">Em Progresso</option>
            <option value="Concluído">Concluído</option>
        </select>`;
    newRow.querySelector('select').value = rowData.status;
    setSelectColorTheme(newRow.querySelector('select'), rowData.status);


    const tempoInput = newRow.querySelector('.tempoInput');
    const tempo = rowData.tempo; // Tempo no formato 00:00:00

    const tempoArray = tempo.split(':').map(Number);
    const durationInSeconds = tempoArray[0] * 3600 + tempoArray[1] * 60 + tempoArray[2];

    if (!isNaN(durationInSeconds)) {
        if (durationInSeconds <= 5 * 60) { 
            tempoInput.style.color = 'rgb(4, 57, 50)';
            tempoInput.style.backgroundColor = 'rgb(197, 231, 219)';
        } else if (durationInSeconds <= 15 * 60) { 
            tempoInput.style.color = 'rgb(127 101 41)';
            tempoInput.style.backgroundColor = 'rgb(251, 235, 198)';
        } else {
            tempoInput.style.color = 'rgb(101, 25, 23)';
            tempoInput.style.backgroundColor = 'rgba(247, 210, 210, 0.83)'; 
        }
    }
}

function formatarDataParaString(data) {
    if (!data || !data.getTime) {
        return '';
    }

    var ano = data.getFullYear();
    var mes = data.getMonth() + 1;
    var dia = data.getDate();

    return ano + '-' + mes.toString().padStart(2, '0') + '-' + dia.toString().padStart(2, '0');
}

function carregarJSON() {
    var table = document.getElementById("table");
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    var moduloSelect = document.getElementById("modulo-select");
    var selectedValue = moduloSelect.value;
    var lsName = "modulo-" + selectedValue;
    var jsonFileName = "modulos/modulo-" + selectedValue + ".json";

    var savedModulo = localStorage.getItem(lsName);
    if (!savedModulo) {
        fetch(jsonFileName).then(response => response.json()).then(data => {
            const dadosString = JSON.stringify(data);
            data.forEach(rowData => construirLinha(rowData));
            localStorage.setItem('modulo-'+selectedValue, dadosString);
            calcularTempoTotal();
        }).catch(error => {
            console.error('Erro ao carregar o arquivo JSON:', error);
        });
    } else {
        const data = JSON.parse(savedModulo);
        data.forEach(rowData => construirLinha(rowData));
        calcularTempoTotal();
    }
}

function moduloChange() {
    var table = document.getElementById("table");
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    var savedModulo = localStorage.getItem('selectedModulo');
    if (savedModulo) {
        var moduloLS = localStorage.getItem('modulo-' + savedModulo);
        if (moduloLS) {
            const data = JSON.parse(moduloLS);
            data.forEach(rowData => construirLinha(rowData));
        } else {
            carregarJSON();
        }
    } else {
        var moduloSelect = document.getElementById("modulo-select");
        var selectedValue = moduloSelect.value;
        localStorage.setItem('selectedModulo', selectedValue);
        moduloChange();
    }
    calcularTempoTotal();
}

const inputDate = document.getElementById('date');
const diasDiv = document.querySelector('.horas-dia');
var moduloSelect = document.getElementById("modulo-select");
moduloSelect.addEventListener('change', function () {
    const selectedValue = moduloSelect.value;
    localStorage.setItem('selectedModulo', selectedValue);
    moduloChange();
}); 

function saveDataToLocalStorage() {
    console.log('Saving data to localStorage...');
    const rows = document.querySelectorAll('#table tr');
    const data = [];

    for (let i = 1; i < rows.length; i++) {
        const columns = rows[i].getElementsByTagName('td');
        const tema = columns[0].querySelector('input').value;
        const tempo = columns[1].querySelector('input').value;
        const status = columns[2].querySelector('select').value;
        const rowData = {
            tema: tema,
            tempo: tempo,
            status: status,
        };
        data.push(rowData);
    }
    var moduloSelect = document.getElementById("modulo-select");
    const selectedValue = moduloSelect.value;
    localStorage.setItem('modulo-'+selectedValue, JSON.stringify(data));
}

window.onload = function() {
    var selectModulo = document.getElementById("modulo-select");
    for (var i = 0; i < selectModulo.options.length; i++) {
        const valueDoModuloSelecionado = selectModulo.options[i].value;
        var moduloLS = localStorage.getItem('modulo-' + valueDoModuloSelecionado);
        if (!moduloLS) { 
            fetch('modulos/modulo-' + valueDoModuloSelecionado + '.json').then(response => response.json()).then(data => {
                const dadosString = JSON.stringify(data);
                localStorage.setItem('modulo-'+valueDoModuloSelecionado, dadosString);
            }).catch(error => {
                console.error('Erro ao carregar o arquivo JSON:', error);
            });
        }
    }
    const savedModulo = localStorage.getItem('selectedModulo');

    if (savedModulo) {
        selectModulo.value = savedModulo;
        carregarJSON();  
    } else {
        localStorage.setItem('selectedModulo', selectModulo.options[0].value); 
        carregarJSON();  
    }
    
    const x = localStorage.getItem('xdias');
    const y = localStorage.getItem('horasDia');
    const tempoTotal = localStorage.getItem('tempoTotal');
    const dataSelecionada = localStorage.getItem('dataSelecionada');
    if (x) {
        if (x > 0) {
            diasDiv.style.display = 'block';
            inputDate.style.color = '';
        } else {
            diasDiv.style.display = 'none';
            inputDate.style.color = 'red';
        }
        document.getElementById('xdias').textContent = `${x}`;
    }
    if (y) {
        document.getElementById('horasDia').textContent = y;
    }
    if (tempoTotal) {
        document.getElementById('tempoTotal').textContent = 'Tempo de Aula Total: ' + tempoTotal;
    }
    if (dataSelecionada) {
        document.getElementById('date').value = formatarDataParaString(new Date(dataSelecionada));
        const diasRestantes = calcularDiasRestantes(new Date(dataSelecionada));
        localStorage.setItem('xdias', diasRestantes);
        const diasDiv = document.querySelector('.horas-dia');
        const inputDate = document.getElementById('date');
        if (diasRestantes > 0) {
            diasDiv.style.display = 'block';
            inputDate.style.color = '';
        } else {
            diasDiv.style.display = 'none';
            inputDate.style.color = 'red';
        }
        document.getElementById('xdias').textContent = `${diasRestantes}`;
    }
}

inputDate.addEventListener('change', function() {
    const dateValue = new Date(inputDate.value);
    dateValue.setHours(23);
    dateValue.setMinutes(59);
    dateValue.setSeconds(59);
    dateValue.setDate(dateValue.getDate() + 1);
    localStorage.setItem('dataSelecionada', dateValue);

    // Calcular e exibir dias restantes
    const diasRestantes = calcularDiasRestantes(dateValue);
    document.getElementById('xdias').textContent = `${diasRestantes}`;
    localStorage.setItem('xdias', diasRestantes);
    if (diasRestantes > 0) {
        diasDiv.style.display = 'block';
        inputDate.style.color = '';
    } else {
        diasDiv.style.display = 'none';
        inputDate.style.color = 'red';
    }

    // Calcular e exibir horas por dia
    calcularTempoRestante(); 
    const tempoRestante = localStorage.getItem('tempoRestante');
    const horasPorDia = calcularHorasPorDia(tempoRestante, diasRestantes);
    document.getElementById('horasDia').textContent = horasPorDia;
    calcularTempoTotal();
});

document.addEventListener('change', function(event) {
    const target = event.target;
    if (target.tagName === 'SELECT' && target.closest('tr') !== null) {
        setSelectColorTheme(target, target.value);
        calcularTempoTotal();
        saveDataToLocalStorage();
    }
});

function calcularTempoTotal() {
    const tempoTotal = localStorage.getItem('tempoTotal') || '00:00:00';
    let tempoInputs = document.querySelectorAll('.tempoInput');
    let totalSeconds = 0;
    let tempoConcluido = 0;

    tempoInputs.forEach(function(input) {
        const row = input.closest('tr');
        const statusSelect = row.querySelector('select');

        let tempo = input.value.split(':');
        let hours = parseInt(tempo[0]) || 0;
        let minutes = parseInt(tempo[1]) || 0;
        let seconds = parseInt(tempo[2]) || 0;

        if (statusSelect.value === 'Concluído') {
            tempoConcluido += hours * 3600 + minutes * 60 + seconds;
        }

        totalSeconds += hours * 3600 + minutes * 60 + seconds;
    });

    let hoursTotal = Math.floor(totalSeconds / 3600);
    let minutesTotal = Math.floor((totalSeconds % 3600) / 60);
    let secondsTotal = Math.ceil(totalSeconds % 60);

    let tempoTotalFormatado = `${hoursTotal.toString().padStart(2, '0')}:${minutesTotal.toString().padStart(2, '0')}:${secondsTotal.toString().padStart(2, '0')}`;
    document.getElementById('tempoTotal').textContent = 'Tempo de Aula Total: ' + tempoTotalFormatado;
    localStorage.setItem('tempoTotal', tempoTotalFormatado);

    // Cálculo do tempo restante
    const tempoRestante = totalSeconds - tempoConcluido;

    // Cálculo dos dias restantes (recuperando do localStorage ou de onde for armazenado)
    const diasRestantes = parseInt(localStorage.getItem('xdias'));

    const tempoRestanteFormatado = formatarTempo(tempoRestante);
    document.getElementById('tempoRestante').textContent = 'Tempo de Aula Restante: ' + tempoRestanteFormatado;
    localStorage.setItem('tempoRestante', tempoRestanteFormatado);

    // Cálculo e exibição das horas por dia
    const horasPorDia = calcularHorasPorDia(tempoRestanteFormatado, diasRestantes);
    document.getElementById('horasDia').textContent = horasPorDia;
}

function calcularTempoRestante(tempoConcluido, totalSeconds) {
    let tempoRestante = totalSeconds - tempoConcluido;

    let hours = Math.floor(tempoRestante / 3600);
    let minutes = Math.floor((tempoRestante % 3600) / 60);
    let seconds = Math.ceil(tempoRestante % 60 + 0.5);

    let tempoRestanteFormatado = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('tempoRestante').textContent = 'Tempo de Aula Restante: ' + tempoRestanteFormatado;
    localStorage.setItem('tempoRestante', tempoRestanteFormatado);

}

function calcularDiasRestantes(dataEscolhida) {
    const dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0);
    dataEscolhida.setHours(0, 0, 0, 0);
    const diffMilliseconds = dataEscolhida.getTime() - dataAtual.getTime();
    let diasRestantes = Math.ceil(diffMilliseconds / (1000 * 60 * 60 * 24));
    return diasRestantes + 1;
}

function formatarTempo(segundos) {
    let horas = Math.floor(segundos / 3600);
    let minutos = Math.floor((segundos % 3600) / 60);
    let segundosRestantes = Math.ceil(segundos % 60);

    if (segundosRestantes >= 60) {
        minutos++;
        segundosRestantes = 0;
    }

    let horasFormatadas = horas.toString().padStart(2, '0');
    let minutosFormatados = minutos.toString().padStart(2, '0');
    let segundosFormatados = segundosRestantes.toString().padStart(2, '0');

    return `${horasFormatadas}:${minutosFormatados}:${segundosFormatados}`;
}

function calcularHorasPorDia(tempoRestante, diasRestantes) {
    let tempoRestanteSegundos = tempoRestante.split(':').reduce((acc, val, index) => {
        return acc + parseInt(val) * (index === 0 ? 3600 : index === 1 ? 60 : 1);
    }, 0);

    if (!isNaN(diasRestantes) && diasRestantes !== 0) {
        let horasPorDia = tempoRestanteSegundos / diasRestantes;

        if (horasPorDia < 0) {
            return '_';
        }

        let horasFormatadas = formatarTempo(horasPorDia);
        return horasFormatadas !== 'NaN:NaN:NaN' ? horasFormatadas : '_';
    } else {
        return tempoRestante;
    }
}