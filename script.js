// Dados fictícios dos atletas com nomes reais e sexo aleatório
const athletes = [
    { name: "Francisco Wallison", sex: "Masculino", hours: 4, speed: 12, endurance: 60 },
    { name: "Kayron Santos", sex: "Feminino", hours: 15, speed: 28, endurance: 25 },
    { name: "Gustavo Wagner", sex: "Masculino", hours: 10, speed: 20, endurance: 45 },
    { name: "Levi Matias", sex: "Feminino", hours: 6, speed: 15, endurance: 35 },
    { name: "Alex Adrian", sex: "Masculino", hours: 12, speed: 23, endurance: 50 },
    { name: "Clara Mendes", sex: "Feminino", hours: 14, speed: 26, endurance: 30 }
];

// Populando a tabela de dados
function populateTable() {
    const tbody = document.getElementById("data-body");
    tbody.innerHTML = ""; // Limpa antes de preencher
    athletes.forEach(athlete => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${athlete.name}</td>
            <td>${athlete.sex}</td>
            <td>${athlete.hours}</td>
            <td>${athlete.speed}</td>
            <td>${athlete.endurance}</td>
        `;
        tbody.appendChild(row);
    });
}
// Função para calcular distância euclidiana (K-Means)
function euclideanDistance(point1, point2) {
    let sum = 0;
    for (let i = 0; i < point1.length; i++) {
        sum += (point1[i] - point2[i]) ** 2;
    }
    return Math.sqrt(sum);
}

// Implementação manual do K-Means
function kMeans(data, k, maxIterations = 100) {
    let centroids = [];
    let usedIndices = new Set();
    while (centroids.length < k) {
        let idx = Math.floor(Math.random() * data.length);
        if (!usedIndices.has(idx)) {
            centroids.push([...data[idx]]);
            usedIndices.add(idx);
        }
    }

    let clusters = new Array(data.length);
    let previousClusters = new Array(data.length).fill(-1);
    let iteration = 0;

    while (iteration < maxIterations) {
        for (let i = 0; i < data.length; i++) {
            let minDistance = Infinity;
            let clusterIndex = 0;
            for (let j = 0; j < k; j++) {
                let distance = euclideanDistance(data[i], centroids[j]);
                if (distance < minDistance) {
                    minDistance = distance;
                    clusterIndex = j;
                }
            }
            clusters[i] = clusterIndex;
        }

        let converged = true;
        for (let i = 0; i < clusters.length; i++) {
            if (clusters[i] !== previousClusters[i]) {
                converged = false;
                break;
            }
        }
        if (converged) break;

        let newCentroids = Array(k).fill().map(() => Array(data[0].length).fill(0));
        let counts = Array(k).fill(0);
        for (let i = 0; i < data.length; i++) {
            let cluster = clusters[i];
            for (let j = 0; j < data[0].length; j++) {
                newCentroids[cluster][j] += data[i][j];
            }
            counts[cluster]++;
        }
        for (let j = 0; j < k; j++) {
            if (counts[j] > 0) {
                for (let dim = 0; dim < data[0].length; dim++) {
                    newCentroids[j][dim] /= counts[j];
                }
            }
        }
        centroids = newCentroids;
        previousClusters = [...clusters];
        iteration++;
    }
    return { clusters, centroids, iterations: iteration };
}

// Aprendizagem Não Supervisionada
function runUnsupervised() {
    const data = athletes.map(a => [a.hours, a.speed, a.endurance]);
    const { clusters, centroids, iterations } = kMeans(data, 3);

    let resultHtml = "<h4>Resultados do Agrupamento (K-Means):</h4>";
    resultHtml += `<p>Número de iterações: ${iterations}</p>`;
    resultHtml += "<ul>";
    athletes.forEach((athlete, i) => {
        let groupName = clusters[i] === 0 ? "Iniciantes" : clusters[i] === 1 ? "Elite" : "Intermediários";
        resultHtml += `<li>${athlete.name} (${athlete.sex}): ${groupName} (Grupo ${clusters[i]})</li>`;
    });
    resultHtml += "</ul>";
    resultHtml += "<h4>Centroides Calculados:</h4><ul>";
    centroids.forEach((centroid, i) => {
        resultHtml += `<li>Grupo ${i}: [Horas: ${centroid[0].toFixed(2)}, Velocidade: ${centroid[1].toFixed(2)}, Resistência: ${centroid[2].toFixed(2)}]</li>`;
    });
    resultHtml += "</ul>";
    document.getElementById("unsupervised-results").innerHTML = resultHtml;

    const ctx = document.getElementById("unsupervised-chart").getContext("2d");
    new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [{
                label: "Atletas",
                data: athletes.map((a, i) => ({ x: a.hours, y: a.speed })),
                backgroundColor: clusters.map(c => ["#e57373", "#4fc3f7", "#81c784"][c]),
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: "Horas de Treino" } },
                y: { title: { display: true, text: "Velocidade (km/h)" } }
            },
            plugins: { legend: { display: true } }
        }
    });
}

// Regressão Linear Manual
function linearRegression(x, y) {
    const n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumXX += x[i] * x[i];
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX); // a
    const intercept = (sumY - slope * sumX) / n; // b
    return { slope, intercept };
}

// Aprendizagem Supervisionada
function runSupervised() {
    const x = athletes.map(a => a.hours);
    const y = athletes.map(a => a.speed);
    const { slope, intercept } = linearRegression(x, y);

    let resultHtml = "<h4>Cálculo da Regressão Linear:</h4>";
    resultHtml += `<p>Equação: Velocidade = ${slope.toFixed(2)} × Horas + ${intercept.toFixed(2)}</p>`;
    resultHtml += "<p>Previsões:</p><ul>";
    const pred8 = slope * 8 + intercept;
    const pred13 = slope * 13 + intercept;
    resultHtml += `<li>8 horas: ${pred8.toFixed(2)} km/h</li>`;
    resultHtml += `<li>13 horas: ${pred13.toFixed(2)} km/h</li>`;
    resultHtml += "</ul>";
    document.getElementById("supervised-results").innerHTML = resultHtml;

    const ctx = document.getElementById("supervised-chart").getContext("2d");
    const regressionPoints = x.map(xi => ({ x: xi, y: slope * xi + intercept }));
    new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [
                {
                    label: "Dados Reais",
                    data: athletes.map(a => ({ x: a.hours, y: a.speed })),
                    backgroundColor: "#e57373",
                    pointRadius: 6
                },
                {
                    label: "Linha de Regressão",
                    type: "line",
                    data: regressionPoints,
                    borderColor: "#0288d1",
                    borderWidth: 2,
                    fill: false,
                    tension: 0
                }
            ]
        },
        options: {
            scales: {
                x: { title: { display: true, text: "Horas de Treino" } },
                y: { title: { display: true, text: "Velocidade (km/h)" } }
            }
        }
    });
}

// Testes Alternativos
function runTests() {
    const speedData = athletes.map(a => [a.speed]);
    const { clusters: speedClusters } = kMeans(speedData, 3);

    const xEndurance = athletes.map(a => a.hours);
    const yEndurance = athletes.map(a => a.endurance);
    const { slope: slopeEnd, intercept: interceptEnd } = linearRegression(xEndurance, yEndurance);

    let resultHtml = "<h4>Teste 1: Agrupamento por Velocidade</h4><ul>";
    athletes.forEach((a, i) => {
        let groupName = speedClusters[i] === 0 ? "Baixa" : speedClusters[i] === 1 ? "Alta" : "Média";
        resultHtml += `<li>${a.name} (${a.sex}): ${groupName} (Grupo ${speedClusters[i]})</li>`;
    });
    resultHtml += "</ul>";
    resultHtml += "<h4>Teste 2: Regressão com Resistência</h4>";
    resultHtml += `<p>Equação: Resistência = ${slopeEnd.toFixed(2)} × Horas + ${interceptEnd.toFixed(2)}</p>`;
    resultHtml += `<p>Previsão para 10 horas: ${(slopeEnd * 10 + interceptEnd).toFixed(2)} min</p>`;
    document.getElementById("test-results").innerHTML = resultHtml;
}

// Previsão de Novo Atleta
function predictNewAthlete() {
    const hours = parseFloat(document.getElementById("new-hours").value) || 0;
    const endurance = parseFloat(document.getElementById("new-endurance").value) || 0;
    const x = athletes.map(a => a.hours);
    const y = athletes.map(a => a.speed);
    const { slope, intercept } = linearRegression(x, y);

    const predictedSpeed = slope * hours + intercept;
    const data = athletes.map(a => [a.hours, a.speed, a.endurance]);
    const newDataPoint = [hours, predictedSpeed, endurance];
    const combinedData = [...data, newDataPoint];
    const { clusters } = kMeans(combinedData, 3);

    let resultHtml = "<h4>Previsão do Novo Atleta:</h4>";
    resultHtml += `<p>Horas: ${hours}, Resistência: ${endurance}</p>`;
    resultHtml += `<p>Velocidade Prevista: ${predictedSpeed.toFixed(2)} km/h</p>`;
    resultHtml += `<p>Grupo Previsto: ${clusters[clusters.length - 1]} (${clusters[clusters.length - 1] === 0 ? "Iniciantes" : clusters[clusters.length - 1] === 1 ? "Elite" : "Intermediários"})</p>`;
    document.getElementById("prediction-results").innerHTML = resultHtml;
}

// Inicialização
populateTable();