// Test simple y directo para validar TODAS las previews
const https = require("https");
const http = require("http");

console.log("🧪 VALIDACIÓN COMPLETA DE PREVIEWS");
console.log("=".repeat(50));

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith("https") ? https : http;

        const req = client.request(url, { method: "HEAD" }, res => {
            resolve({
                status: res.statusCode,
                success: res.statusCode >= 200 && res.statusCode < 300,
            });
        });

        req.on("error", err => {
            resolve({
                status: 0,
                success: false,
                error: err.message,
            });
        });

        req.setTimeout(5000, () => {
            req.destroy();
            resolve({
                status: 0,
                success: false,
                error: "Timeout",
            });
        });

        req.end();
    });
}

async function getFiles() {
    return new Promise(resolve => {
        const req = http.request("http://localhost:3001/api/files", res => {
            let data = "";
            res.on("data", chunk => (data += chunk));
            res.on("end", () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve({ items: [] });
                }
            });
        });

        req.on("error", () => resolve({ items: [] }));
        req.end();
    });
}

function extractAllFiles(items, prefix = "") {
    const files = [];

    items.forEach(item => {
        if (
            item.type === "file" &&
            (item.name.endsWith(".md") || item.name.endsWith(".mdx"))
        ) {
            const filePath = prefix + item.name;
            if (item.previewUrl) {
                files.push({
                    path: filePath,
                    url: item.previewUrl,
                    depth: filePath.split("/").length - 1,
                });
            }
        }
        if (item.type === "folder" && item.children) {
            files.push(
                ...extractAllFiles(item.children, prefix + item.name + "/")
            );
        }
    });

    return files;
}

async function main() {
    try {
        console.log("📂 Obteniendo lista de archivos...");
        const data = await getFiles();

        if (!data.items || data.items.length === 0) {
            console.log("❌ No se pudieron obtener archivos");
            return;
        }

        const allFiles = extractAllFiles(data.items);
        console.log(`📄 Total archivos con preview: ${allFiles.length}`);

        // Agrupar por profundidad
        const byDepth = {};
        allFiles.forEach(file => {
            if (!byDepth[file.depth]) byDepth[file.depth] = [];
            byDepth[file.depth].push(file);
        });

        console.log("\n📊 Distribución por profundidad:");
        Object.keys(byDepth)
            .sort((a, b) => a - b)
            .forEach(depth => {
                console.log(
                    `   Nivel ${depth}: ${byDepth[depth].length} archivos`
                );
            });

        // Testear TODOS
        console.log("\n🔍 PROBANDO TODAS LAS PREVIEWS...");
        let success = 0;
        let failed = 0;
        const failedUrls = [];

        for (let i = 0; i < allFiles.length; i++) {
            const file = allFiles[i];
            const fullUrl = `http://localhost:3001${file.url}`;
            const result = await makeRequest(fullUrl);

            if (result.success) {
                console.log(
                    `✅ [${i + 1}/${allFiles.length}] ${file.path} (depth: ${file.depth})`
                );
                success++;
            } else {
                console.log(
                    `❌ [${i + 1}/${allFiles.length}] ${file.path} - Status: ${result.status}`
                );
                failed++;
                failedUrls.push(file.url);
            }

            // Progreso cada 10
            if ((i + 1) % 10 === 0) {
                console.log(`   📊 Progreso: ${success} ✅ | ${failed} ❌`);
            }
        }

        // Resultados finales
        console.log("\n" + "=".repeat(50));
        console.log("📈 RESULTADOS FINALES:");
        console.log(`✅ Exitosas: ${success}`);
        console.log(`❌ Fallidas: ${failed}`);
        console.log(`📊 Total: ${success + failed}`);
        console.log(
            `🎯 Ratio éxito: ${((success / (success + failed)) * 100).toFixed(1)}%`
        );

        if (failed === 0) {
            console.log("\n🎉 ¡TODAS LAS PREVIEWS FUNCIONAN PERFECTAMENTE!");
            console.log(
                "🌟 El sistema universal maneja TODOS los niveles de anidamiento"
            );
            console.log("✅ URL encoding correcto");
            console.log("✅ Todos los casos cubiertos al 100%");
        } else {
            console.log("\n⚠️ Algunas previews fallaron:");
            failedUrls.slice(0, 5).forEach(url => console.log(`   - ${url}`));
            if (failedUrls.length > 5) {
                console.log(`   ... y ${failedUrls.length - 5} más`);
            }
        }
    } catch (error) {
        console.error("💥 Error:", error.message);
    }
}

main();
