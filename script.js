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
    animals.forEach(animal => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${animal.name}</td>
            <td>${animal.hours}</td>
            <td>${animal.speed}</td>
            <td>${animal.endurance}</td>
        `;
        tbody.appendChild(row);
    });
}

// Função para calcular a distância euclidiana (usada no K-Means)
function euclideanDistance(point1, point2) {
    return Math.sqrt(point1.reduce((sum, val, i) => sum + (val - point2[i]) ** 2, 0));
}

// Implementação manual do K-Means
function kMeans(data, k, maxIterations = 100) {
    // Inicializando centroides aleatoriamente
    let centroids = [];
    for (let i = 0; i < k; i++) {
        centroids.push(data[Math.floor(Math.random() * data.length)].slice());
    }

    let clusters = new Array(data.length);
    for (let iter = 0; iter < maxIterations; iter++) {
        // Atribuir cada ponto ao centroide mais próximo
        for (let i = 0; i < data.length; i++) {
            let minDist = Infinity;
            let clusterIdx = 0;
            for (let j = 0; j < k; j++) {
                let dist = euclideanDistance(data[i], centroids[j]);
                if (dist < minDist) {
                    minDist = dist;
                    clusterIdx = j;
                }
            }
            clusters[i] = clusterIdx;
        }

        // Recalcular centroides
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
                newCentroids[j] = newCentroids[j].map(val => val / counts[j]);
            }
        }

        // Verificar convergência
        let converged = true;
        for (let j = 0; j < k; j++) {
            if (euclideanDistance(centroids[j], newCentroids[j]) > 0.001) {
                converged = false;
                break;
            }
        }
        centroids = newCentroids;
        if (converged) break;
    }
    return { clusters, centroids };
}

// Aprendizagem Não Supervisionada
function runUnsupervised() {
    const data = animals.map(a => [a.hours, a.speed, a.endurance]);
    const { clusters, centroids } = kMeans(data, 3);

    let resultHtml = "<h4>Resultados do Agrupamento:</h4>";
    resultHtml += "<ul>";
    animals.forEach((animal, i) => {
        resultHtml += `<li>${animal.name}: Grupo ${clusters[i]}</li>`;
    });
    resultHtml += "</ul>";
    resultHtml += "<h4>Centroides:</h4><ul>";
    centroids.forEach((centroid, i) => {
        resultHtml += `<li>Grupo ${i}: [Horas: ${centroid[0].toFixed(2)}, Velocidade: ${centroid[1].toFixed(2)}, Resistência: ${centroid[2].toFixed(2)}]</li>`;
    });
    resultHtml += "</ul>";
    document.getElementById("unsupervised-results").innerHTML = resultHtml;

    // Gráfico
    const ctx = document.getElementById("unsupervised-chart").getContext("2d");
    new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [{
                label: "Animais",
                data: animals.map((a, i) => ({ x: a.hours, y: a.speed, group: clusters[i] })),
                backgroundColor: clusters.map(c => ["#e74c3c", "#3498db", "#2ecc71"][c]),
                pointRadius: 5
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: "Horas de Treino" } },
                y: { title: { display: true, text: "Velocidade (km/h)" } }
            }
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
    const a = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const b = (sumY - a * sumX) / n;
    return { a, b };
}

// Aprendizagem Supervisionada
function runSupervised() {
    const x = animals.map(a => a.hours);
    const y = animals.map(a => a.speed);
    const { a, b } = linearRegression(x, y);

    let resultHtml = `<h4>Equação: Y = ${a.toFixed(2)}X + ${b.toFixed(2)}</h4>`;
    resultHtml += "<p>Previsões:</p><ul>";
    resultHtml += `<li>8 horas: ${(a * 8 + b).toFixed(2)} km/h</li>`;
    resultHtml += `<li>13 horas: ${(a * 13 + b).toFixed(2)} km/h</li>`;
    resultHtml += "</ul>";
    document.getElementById("supervised-results").innerHTML = resultHtml;

    // Gráfico
    const ctx = document.getElementById("supervised-chart").getContext("2d");
    const regressionLine = x.map(xi => ({ x: xi, y: a * xi + b }));
    new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [
                { label: "Dados", data: animals.map(a => ({ x: a.hours, y: a.speed })), backgroundColor: "#e74c3c" },
                { label: "Regressão", type: "line", data: regressionLine, borderColor: "#3498db", fill: false }
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
    // Teste 1: Agrupamento só por velocidade
    const speedData = animals.map(a => [a.speed]);
    const { clusters: speedClusters } = kMeans(speedData, 3);

    // Teste 2: Regressão com horas e resistência
    const xEndurance = animals.map(a => a.hours);
    const yEndurance = animals.map(a => a.endurance);
    const { a: aEnd, b: bEnd } = linearRegression(xEndurance, yEndurance);

    let resultHtml = "<h4>Teste 1: Agrupamento por Velocidade</h4><ul>";
    animals.forEach((a, i) => {
        resultHtml += `<li>${a.name}: Grupo ${speedClusters[i]}</li>`;
    });
    resultHtml += "</ul>";
    resultHtml += `<h4>Teste 2: Regressão com Resistência</h4>`;
    resultHtml += `<p>Equação: Y = ${aEnd.toFixed(2)}X + ${bEnd.toFixed(2)}</p>`;
    resultHtml += `<p>Previsão para 10 horas: ${(aEnd * 10 + bEnd).toFixed(2)} min</p>`;
    document.getElementById("test-results").innerHTML = resultHtml;
}

// Previsão de Novo Animal
function predictNewAnimal() {
    const hours = parseFloat(document.getElementById("new-hours").value);
    const endurance = parseFloat(document.getElementById("new-endurance").value);
    const x = animals.map(a => a.hours);
    const y = animals.map(a => a.speed);
    const { a, b } = linearRegression(x, y);

    const predictedSpeed = a * hours + b;
    const data = animals.map(a => [a.hours, a.speed, a.endurance]);
    const { clusters } = kMeans(data, 3);
    const newData = [[hours, predictedSpeed, endurance]];
    const { clusters: newCluster } = kMeans([...data, ...newData], 3);

    document.getElementById("prediction-results").innerHTML = `
        <h4>Resultado:</h4>
        <p>Velocidade prevista: ${predictedSpeed.toFixed(2)} km/h</p>
        <p>Grupo: ${newCluster[newCluster.length - 1]}</p>
    `;
}

// Inicialização
populateTable();