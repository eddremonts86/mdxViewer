/**
 * HTML report generation utilities
 */

import type { SmellReport } from "./types";

function generateHTMLStyles(): string {
    return `
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-left: 4px solid #667eea;
        }
        .stat-number { font-size: 2.5em; font-weight: bold; margin-bottom: 10px; }
        .stat-label { color: #666; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; }
        .error { color: #e74c3c; }
        .warning { color: #f39c12; }
        .info { color: #3498db; }
        .chart-container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .recommendations {
            background: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .recommendations h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.4em;
        }
        .recommendation {
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
            background: #ecf0f1;
        }
        .smells-table {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        table { width: 100%; border-collapse: collapse; }
        th {
            background: #34495e;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        td {
            padding: 12px 15px;
            border-bottom: 1px solid #ecf0f1;
        }
        tr:hover { background: #f8f9fa; }
        .severity-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .severity-error { background: #e74c3c; color: white; }
        .severity-warning { background: #f39c12; color: white; }
        .severity-info { background: #3498db; color: white; }
        .fixable { color: #27ae60; font-weight: bold; }
        .not-fixable { color: #e74c3c; }
        h1, h2, h3 { color: #2c3e50; }
        .timestamp { opacity: 0.7; font-size: 0.9em; }
    `;
}

function generateStatsSection(report: SmellReport): string {
    return `
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${report.totalFiles}</div>
                <div class="stat-label">Files Analyzed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${report.totalSmells}</div>
                <div class="stat-label">Total Issues</div>
            </div>
            <div class="stat-card">
                <div class="stat-number error">${report.errors}</div>
                <div class="stat-label">Errors</div>
            </div>
            <div class="stat-card">
                <div class="stat-number warning">${report.warnings}</div>
                <div class="stat-label">Warnings</div>
            </div>
        </div>
    `;
}

function generateSmellsTable(report: SmellReport): string {
    const tableRows = report.smells
        .map(
            smell => `
                        <tr>
                            <td><code>${smell.file}</code></td>
                            <td>${smell.line}:${smell.column}</td>
                            <td><code>${smell.rule}</code></td>
                            <td><span class="severity-badge severity-${smell.severity}">${smell.severity}</span></td>
                            <td>${smell.category}</td>
                            <td>${smell.message}</td>
                            <td class="${smell.fixable ? "fixable" : "not-fixable"}">
                                ${smell.fixable ? "✅ Auto-fixable" : "❌ Manual fix required"}
                            </td>
                        </tr>
                    `
        )
        .join("");

    return `
        <div class="smells-table">
            <table>
                <thead>
                    <tr>
                        <th>File</th>
                        <th>Line</th>
                        <th>Rule</th>
                        <th>Severity</th>
                        <th>Category</th>
                        <th>Message</th>
                        <th>Fixable</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

function generateChartScript(report: SmellReport): string {
    return `
        const ctx = document.getElementById('categoryChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [${Object.keys(report.categories)
                    .map(c => `"${c}"`)
                    .join(",")}],
                datasets: [{
                    data: [${Object.values(report.categories).join(",")}],
                    backgroundColor: [
                        '#e74c3c', '#f39c12', '#f1c40f', '#2ecc71',
                        '#3498db', '#9b59b6', '#34495e', '#95a5a6'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    `;
}

export function generateHTMLReport(report: SmellReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Smell Report - MDXViewer</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        ${generateHTMLStyles()}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Code Smell Analysis Report</h1>
            <p class="timestamp">Generated: ${report.timestamp}</p>
            <p>Comprehensive code quality analysis for MDXViewer project</p>
        </div>

        ${generateStatsSection(report)}

        <div class="chart-container">
            <h3>Issues by Category</h3>
            <canvas id="categoryChart" width="400" height="200"></canvas>
        </div>

        <div class="recommendations">
            <h3>🎯 Recommendations</h3>
            ${report.recommendations.map(rec => `<div class="recommendation">${rec}</div>`).join("")}
        </div>

        ${generateSmellsTable(report)}
    </div>

    <script>
        ${generateChartScript(report)}
    </script>
</body>
</html>`;
}
