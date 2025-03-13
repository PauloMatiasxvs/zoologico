// Dados fictícios dos jogadores de basquete (todos masculinos)
const players = [
    { name: "Francisco Wallison", sex: "Masculino", hours: 4, speed: 12, endurance: 60, accuracy: 70 },
    { name: "Kayron Santos", sex: "Masculino", hours: 15, speed: 28, endurance: 25, accuracy: 85 },
    { name: "Gustavo Wagner", sex: "Masculino", hours: 10, speed: 20, endurance: 45, accuracy: 78 },
    { name: "Levi Matias", sex: "Masculino", hours: 6, speed: 15, endurance: 35, accuracy: 65 },
    { name: "Alex Adrian", sex: "Masculino", hours: 12, speed: 23, endurance: 50, accuracy: 80 },
    { name: "João Pedro", sex: "Masculino", hours: 14, speed: 26, endurance: 30, accuracy: 82 }
];

// Populando a tabela de dados
function populateTable() {
    const tbody = document.getElementById("data-body");
    tbody.innerHTML = "";
    players.forEach(player => {
        const row = document.createElement("tr");
        row.className = "border-b border-gray-700 hover:bg-gray-700 transition";
        row.innerHTML = `
            <td class="p-3">${player.name}</td>
            <td class="p-3">${player.sex}</td>
            <td class="p-3">${player.hours}</td>
            <td class="p-3">${player.speed}</td>
            <td class="p-3">${player.endurance}</td>
            <td class="p-3">${player.accuracy}</td>
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

// Aprendizagem Não Supervisionada - Posição no Time
function runUnsupervised() {
    const data = players.map(p => [p.speed, p.endurance, p.accuracy]);
    const { clusters, centroids, iterations } = kMeans(data, 3);

    let resultHtml = "<h3 class='text-lg font-semibold text-orange-300'>Agrupamento por Posição:</h3>";
    resultHtml += `<p class='text-gray-300'>Iterações: ${iterations}</p>`;
    resultHtml += "<ul class='list-disc pl-5 text-gray-200'>";
    players.forEach((player, i) => {
        let position = clusters[i] === 0 ? "Pivô" : clusters[i] === 1 ? "Armador" : "Ala";
        resultHtml += `<li>${player.name}: ${position} (Grupo ${clusters[i]})</li>`;
    });
    resultHtml += "</ul>";
    resultHtml += "<h3 class='text-lg font-semibold text-orange-300 mt-4'>Centroides:</h3><ul class='list-disc pl-5 text-gray-200'>";
    centroids.forEach((centroid, i) => {
        resultHtml += `<li>Grupo ${i}: [Velocidade: ${centroid[0].toFixed(2)}, Resistência: ${centroid[1].toFixed(2)}, Precisão: ${centroid[2].toFixed(2)}]</li>`;
    });
    resultHtml += "</ul>";
    document.getElementById("unsupervised-results").innerHTML = resultHtml;

    const ctx = document.getElementById("unsupervised-chart").getContext("2d");
    new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [{
                label: "Jogadores",
                data: players.map((p, i) => ({ x: p.speed, y: p.accuracy })),
                backgroundColor: clusters.map(c => ["#ff5722", "#0288d1", "#4caf50"][c]),
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: "Velocidade (km/h)" } },
                y: { title: { display: true, text: "Precisão (%)" } }
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
        sumIND = x[i] * y[i];
        sumXX += x[i] * x[i];
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
}

// Aprendizagem Supervisionada - Série do Time
function runSupervised() {
    const x = players.map(p => p.hours);
    const y = players.map(p => p.speed * 0.4 + p.accuracy * 0.6); // Pontuação composta
    const { slope, intercept } = linearRegression(x, y);

    let resultHtml = "<h3 class='text-lg font-semibold text-orange-300'>Regressão para Série do Time:</h3>";
    resultHtml += `<p class='text-gray-300'>Equação: Pontuação = ${slope.toFixed(2)} × Horas + ${intercept.toFixed(2)}</p>`;
    resultHtml += "<p class='mt-2 text-gray-300'>Previsões:</p><ul class='list-disc pl-5 text-gray-200'>";
    const pred8 = slope * 8 + intercept;
    const pred13 = slope * 13 + intercept;
    resultHtml += `<li>8 horas: ${pred8.toFixed(2)} pontos (${pred8 > 70 ? "Série A" : pred8 > 50 ? "Série B" : "Série C"})</li>`;
    resultHtml += `<li>13 horas: ${pred13.toFixed(2)} pontos (${pred13 > 70 ? "Série A" : pred13 > 50 ? "Série B" : "Série C"})</li>`;
    resultHtml += "</ul>";
    document.getElementById("supervised-results").innerHTML = resultHtml;

    const ctx = document.getElementById("supervised-chart").getContext("2d");
    const regressionPoints = x.map(xi => ({ x: xi, y: slope * xi + intercept }));
    new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [
                {
                    label: "Pontuação Real",
                    data: players.map(p => ({ x: p.hours, y: p.speed * 0.4 + p.accuracy * 0.6 })),
                    backgroundColor: "#ff5722",
                    pointRadius: 6
                },
                {
                    label: "Regressão",
                    type: "line",
                    data: regressionPoints,
                    borderColor: "#0288d1",
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            scales: {
                x: { title: { display: true, text: "Horas de Treino" } },
                y: { title: { display: true, text: "Pontuação" } }
            }
        }
    });
}

// Testes Alternativos
function runTests() {
    const accuracyData = players.map(p => [p.accuracy]);
    const { clusters: accuracyClusters } = kMeans(accuracyData, 3);

    const xEndurance = players.map(p => p.hours);
    const yEndurance = players.map(p => p.endurance);
    const { slope: slopeEnd, intercept: interceptEnd } = linearRegression(xEndurance, yEndurance);

    let resultHtml = "<h3 class='text-lg font-semibold text-orange-300'>Teste 1: Agrupamento por Precisão</h3><ul class='list-disc pl-5 text-gray-200'>";
    players.forEach((p, i) => {
        let level = accuracyClusters[i] === 0 ? "Baixa" : accuracyClusters[i] === 1 ? "Alta" : "Média";
        resultHtml += `<li>${p.name}: ${level} (Grupo ${accuracyClusters[i]})</li>`;
    });
    resultHtml += "</ul>";
    resultHtml += "<h3 class='text-lg font-semibold text-orange-300 mt-4'>Teste 2: Regressão com Resistência</h3>";
    resultHtml += `<p class='text-gray-300'>Equação: Resistência = ${slopeEnd.toFixed(2)} × Horas + ${interceptEnd.toFixed(2)}</p>`;
    resultHtml += `<p class='text-gray-300'>Previsão para 10 horas: ${(slopeEnd * 10 + interceptEnd).toFixed(2)} min</p>`;
    document.getElementById("test-results").innerHTML = resultHtml;
}

// Previsão de Novo Jogador
function predictNewPlayer() {
    const hours = parseFloat(document.getElementById("new-hours").value) || 0;
    const endurance = parseFloat(document.getElementById("new-endurance").value) || 0;
    const accuracy = parseFloat(document.getElementById("new-accuracy").value) || 0;
    const x = players.map(p => p.hours);
    const y = players.map(p => p.speed * 0.4 + p.accuracy * 0.6);
    const { slope, intercept } = linearRegression(x, y);

    const predictedScore = slope * hours + intercept;
    const predictedSpeed = (predictedScore - accuracy * 0.6) / 0.4; // Aproximação
    const data = players.map(p => [p.speed, p.endurance, p.accuracy]);
    const newDataPoint = [predictedSpeed, endurance, accuracy];
    const combinedData = [...data, newDataPoint];
    const { clusters } = kMeans(combinedData, 3);

    let resultHtml = "<h3 class='text-lg font-semibold text-orange-300'>Previsão do Novo Jogador:</h3>";
    resultHtml += `<p class='text-gray-300'>Horas: ${hours}, Resistência: ${endurance}, Precisão: ${accuracy}</p>`;
    resultHtml += `<p class='text-gray-300'>Pontuação Prevista: ${predictedScore.toFixed(2)} (${predictedScore > 70 ? "Série A" : predictedScore > 50 ? "Série B" : "Série C"})</p>`;
    resultHtml += `<p class='text-gray-300'>Posição Prevista: ${clusters[clusters.length - 1] === 0 ? "Pivô" : clusters[clusters.length - 1] === 1 ? "Armador" : "Ala"}</p>`;
    document.getElementById("prediction-results").innerHTML = resultHtml;
}

// Inicialização
populateTable();