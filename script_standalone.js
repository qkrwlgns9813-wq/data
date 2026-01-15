// ===== Data Storage =====
let allStudents = [];
let filteredStudents = [];
let classChart = null;
let distributionChart = null;

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
});

// ===== Load Data from Embedded CSV =====
function loadData() {
    try {
        parseCSV(CSV_DATA);
        displayData();
        updateStatistics();
        updateGradeDistribution();
        createCharts();
    } catch (error) {
        console.error('Error loading data:', error);
        alert('데이터를 불러오는데 실패했습니다.');
    }
}

// ===== Parse CSV =====
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');

    allStudents = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',');

        const student = {
            class: parseInt(values[0]),
            number: parseInt(values[1]),
            name: values[2],
            finalExam: parseFloat(values[3]),
            performance1: parseFloat(values[4]),
            performance2: parseFloat(values[5]),
            performance3: parseFloat(values[6]),
            total: parseFloat(values[7])
        };

        student.grade = getGrade(student.total);
        allStudents.push(student);
    }

    filteredStudents = [...allStudents];
}

// ===== Get Grade Letter =====
function getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
}

// ===== Display Data in Table =====
function displayData() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    filteredStudents.forEach((student, index) => {
        const row = document.createElement('tr');
        row.style.animationDelay = `${index * 0.02}s`;
        row.style.animation = 'fadeInUp 0.4s ease-out both';

        row.innerHTML = `
            <td>${student.class}</td>
            <td>${student.number}</td>
            <td><strong>${student.name}</strong></td>
            <td>${student.finalExam.toFixed(1)}</td>
            <td>${student.performance1.toFixed(1)}</td>
            <td>${student.performance2.toFixed(1)}</td>
            <td>${student.performance3.toFixed(1)}</td>
            <td><strong>${student.total.toFixed(1)}</strong></td>
            <td><span class="grade-badge grade-badge-${student.grade.toLowerCase()}">${student.grade}</span></td>
        `;

        tableBody.appendChild(row);
    });

    // Update total students count
    document.getElementById('totalStudents').textContent = filteredStudents.length;
}

// ===== Update Statistics =====
function updateStatistics() {
    if (filteredStudents.length === 0) {
        document.getElementById('avgScore').textContent = '0.0';
        document.getElementById('maxScore').textContent = '0.0';
        document.getElementById('minScore').textContent = '0.0';
        document.getElementById('stdDev').textContent = '0.0';
        document.getElementById('maxStudent').textContent = '-';
        document.getElementById('minStudent').textContent = '-';
        return;
    }

    // Calculate average
    const avg = filteredStudents.reduce((sum, s) => sum + s.total, 0) / filteredStudents.length;

    // Find max and min
    const maxStudent = filteredStudents.reduce((max, s) => s.total > max.total ? s : max);
    const minStudent = filteredStudents.reduce((min, s) => s.total < min.total ? s : min);

    // Calculate standard deviation
    const variance = filteredStudents.reduce((sum, s) => sum + Math.pow(s.total - avg, 2), 0) / filteredStudents.length;
    const stdDev = Math.sqrt(variance);

    // Update UI with animation
    animateValue('avgScore', 0, avg, 1000);
    animateValue('maxScore', 0, maxStudent.total, 1000);
    animateValue('minScore', 0, minStudent.total, 1000);
    animateValue('stdDev', 0, stdDev, 1000);

    document.getElementById('maxStudent').textContent = `${maxStudent.name} (${maxStudent.class}분반)`;
    document.getElementById('minStudent').textContent = `${minStudent.name} (${minStudent.class}분반)`;
}

// ===== Animate Number Values =====
function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = current.toFixed(1);
    }, 16);
}

// ===== Update Grade Distribution =====
function updateGradeDistribution() {
    const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 };

    filteredStudents.forEach(student => {
        gradeCounts[student.grade]++;
    });

    const total = filteredStudents.length || 1;

    // Update bars with animation
    Object.keys(gradeCounts).forEach(grade => {
        const count = gradeCounts[grade];
        const percentage = (count / total) * 100;

        const bar = document.getElementById(`gradeBar${grade}`);
        const countElement = document.getElementById(`gradeCount${grade}`);

        setTimeout(() => {
            bar.style.width = `${percentage}%`;
        }, 100);

        countElement.textContent = `${count}명 (${percentage.toFixed(1)}%)`;
    });
}

// ===== Create Charts =====
function createCharts() {
    createClassChart();
    createDistributionChart();
}

// ===== Create Class Average Chart =====
function createClassChart() {
    const ctx = document.getElementById('classChart').getContext('2d');

    // Calculate class averages
    const classAverages = {};
    const classCounts = {};

    filteredStudents.forEach(student => {
        if (!classAverages[student.class]) {
            classAverages[student.class] = 0;
            classCounts[student.class] = 0;
        }
        classAverages[student.class] += student.total;
        classCounts[student.class]++;
    });

    const labels = [];
    const data = [];

    for (let i = 1; i <= 5; i++) {
        labels.push(`${i}분반`);
        data.push(classCounts[i] ? (classAverages[i] / classCounts[i]).toFixed(2) : 0);
    }

    if (classChart) {
        classChart.destroy();
    }

    classChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '평균 점수',
                data: data,
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(79, 172, 254, 0.8)',
                    'rgba(67, 233, 123, 0.8)',
                    'rgba(250, 112, 154, 0.8)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(118, 75, 162, 1)',
                    'rgba(79, 172, 254, 1)',
                    'rgba(67, 233, 123, 1)',
                    'rgba(250, 112, 154, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#a0a0c0',
                    borderColor: 'rgba(102, 126, 234, 0.5)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return `평균: ${context.parsed.y}점`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(102, 126, 234, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#a0a0c0',
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#a0a0c0',
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// ===== Create Score Distribution Chart =====
function createDistributionChart() {
    const ctx = document.getElementById('distributionChart').getContext('2d');

    // Create score ranges
    const ranges = {
        '0-59': 0,
        '60-69': 0,
        '70-79': 0,
        '80-89': 0,
        '90-100': 0
    };

    filteredStudents.forEach(student => {
        const score = student.total;
        if (score < 60) ranges['0-59']++;
        else if (score < 70) ranges['60-69']++;
        else if (score < 80) ranges['70-79']++;
        else if (score < 90) ranges['80-89']++;
        else ranges['90-100']++;
    });

    if (distributionChart) {
        distributionChart.destroy();
    }

    distributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(ranges),
            datasets: [{
                data: Object.values(ranges),
                backgroundColor: [
                    'rgba(245, 87, 108, 0.8)',
                    'rgba(254, 225, 64, 0.8)',
                    'rgba(67, 233, 123, 0.8)',
                    'rgba(79, 172, 254, 0.8)',
                    'rgba(102, 126, 234, 0.8)'
                ],
                borderColor: [
                    'rgba(245, 87, 108, 1)',
                    'rgba(254, 225, 64, 1)',
                    'rgba(67, 233, 123, 1)',
                    'rgba(79, 172, 254, 1)',
                    'rgba(102, 126, 234, 1)'
                ],
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#a0a0c0',
                        padding: 15,
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 26, 46, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#a0a0c0',
                    borderColor: 'rgba(102, 126, 234, 0.5)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function (context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}점: ${context.parsed}명 (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// ===== Setup Event Listeners =====
function setupEventListeners() {
    // Class filter
    document.getElementById('classFilter').addEventListener('change', applyFilters);

    // Search input
    document.getElementById('searchInput').addEventListener('input', applyFilters);

    // Sort by
    document.getElementById('sortBy').addEventListener('change', applyFilters);

    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
}

// ===== Apply Filters =====
function applyFilters() {
    const classFilter = document.getElementById('classFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sortBy = document.getElementById('sortBy').value;

    // Filter by class
    filteredStudents = allStudents.filter(student => {
        if (classFilter !== 'all' && student.class !== parseInt(classFilter)) {
            return false;
        }
        return true;
    });

    // Filter by search term
    if (searchTerm) {
        filteredStudents = filteredStudents.filter(student => {
            return student.name.toLowerCase().includes(searchTerm) ||
                student.number.toString().includes(searchTerm);
        });
    }

    // Sort
    switch (sortBy) {
        case 'number':
            filteredStudents.sort((a, b) => {
                if (a.class === b.class) {
                    return a.number - b.number;
                }
                return a.class - b.class;
            });
            break;
        case 'total-desc':
            filteredStudents.sort((a, b) => b.total - a.total);
            break;
        case 'total-asc':
            filteredStudents.sort((a, b) => a.total - b.total);
            break;
        case 'final-desc':
            filteredStudents.sort((a, b) => b.finalExam - a.finalExam);
            break;
    }

    // Update display
    displayData();
    updateStatistics();
    updateGradeDistribution();
    createCharts();
}

// ===== Export to CSV =====
function exportToCSV() {
    let csv = '분반,번호,이름,기말고사,수행1,수행2,수행3,총점,등급\n';

    filteredStudents.forEach(student => {
        csv += `${student.class},${student.number},${student.name},${student.finalExam},${student.performance1},${student.performance2},${student.performance3},${student.total},${student.grade}\n`;
    });

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `성적분석_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    showNotification('CSV 파일이 다운로드되었습니다!');
}

// ===== Show Notification =====
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        font-weight: 600;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
