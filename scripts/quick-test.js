#!/usr/bin/env node

const http = require("http");

function testEndpoint(path) {
    return new Promise(resolve => {
        const options = {
            hostname: "localhost",
            port: 3001,
            path,
            method: "GET",
            timeout: 5000,
        };

        const req = http.request(options, res => {
            let data = "";
            res.on("data", chunk => {
                data += chunk;
            });
            res.on("end", () => {
                resolve({
                    path,
                    status: res.statusCode,
                    success: res.statusCode === 200,
                    contentType: res.headers["content-type"],
                    dataLength: data.length,
                });
            });
        });

        req.on("timeout", () => {
            req.destroy();
            resolve({
                path,
                status: "timeout",
                success: false,
                error: "Request timeout",
            });
        });

        req.on("error", e => {
            resolve({
                path,
                status: "error",
                success: false,
                error: e.message,
            });
        });

        req.setTimeout(5000);
        req.end();
    });
}

async function runQuickTest() {
    console.log("🔍 Quick Preview Test\n");

    const testUrls = [
        "/api/health",
        "/api/files",
        "/api/previews/docs%2Fapi-improvements.png",
        "/api/previews/project-docs%2Ffeatures%2Ffile-management-system.png",
        "/api/previews/tests%2Fnavigation%2Fdeep-nested%2Flevel4%2Flevel5%2Flevel6%2Ftest-10-levels.png",
    ];

    for (const url of testUrls) {
        const result = await testEndpoint(url);
        if (result.success) {
            console.log(
                `✅ ${url} - Status: ${result.status} (${result.dataLength} bytes)`
            );
        } else {
            console.log(`❌ ${url} - ${result.error || result.status}`);
        }
    }
}

runQuickTest().catch(console.error);
