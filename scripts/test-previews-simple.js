#!/usr/bin/env node

// Test específico de algunas previews para validar el sistema universal
const testUrls = [
    // Nivel simple
    "http://localhost:3001/api/previews/docs%2Fintroduction.png",

    // Nivel doble
    "http://localhost:3001/api/previews/project-docs%2FREADME.png",

    // Nivel triple
    "http://localhost:3001/api/previews/project-docs%2Ffeatures%2Fdrag-and-drop-implementation.png",

    // Nivel ultra-profundo (10 niveles)
    "http://localhost:3001/api/previews/tests%2Fnavigation%2Fdeep-nested%2Flevel4%2Flevel5%2Flevel6%2Ftest-10-levels.png",
];

console.log("🧪 Testing Universal Preview System...\n");

// Test cada URL usando fetch nativo
async function testPreviews() {
    for (const url of testUrls) {
        try {
            console.log(`Testing: ${url}`);

            const response = await fetch(url);
            const { status } = response;
            const contentType = response.headers.get("content-type");

            if (status === 200 && contentType?.includes("image/png")) {
                console.log(
                    `✅ SUCCESS - Status: ${status}, Type: ${contentType}`
                );
            } else {
                console.log(
                    `❌ FAILED - Status: ${status}, Type: ${contentType}`
                );
                if (status !== 200) {
                    const text = await response.text();
                    console.log(`   Error: ${text.substring(0, 100)}...`);
                }
            }
        } catch (error) {
            console.log(`💥 ERROR - ${error.message}`);
        }
        console.log("");
    }

    console.log("🏁 Universal Preview Test Complete!");
}

testPreviews().catch(console.error);
