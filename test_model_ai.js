const InsightService = require('./src/service/InisightsService');

// Simulasi path: Pastikan file json ada di root project agar terbaca
// Script ini asumsi dijalankan dari root
const service = new InsightService();

console.log("\n🤖 --- TEST PREDIKSI DENGAN DATASET JSON ---");

// Skenario 1: User Santai (Nilai Rating Tinggi, Materi Sedikit)
// [materials_per_day, avg_rating, study_time]
const inputUser1 = [15, 4.5, 8.0]; 
try {
  const result1 = service.classifyUser(inputUser1);
  console.log(`\nUser A (Santai): ${JSON.stringify(inputUser1)}`);
  console.log(`-> Prediksi Cluster: ${result1.cluster}`);
  console.log(`-> Label: ${result1.result.label}`);
  console.log(`-> Rekomendasi: ${result1.result.recommendation.substring(0, 50)}...`);
} catch (e) {
  console.log("Error:", e.message);
}

// Skenario 2: User Ngebut (Materi Banyak per hari)
const inputUser2 = [35, 2.0, 5.0]; 
try {
  const result2 = service.classifyUser(inputUser2);
  console.log(`\nUser B (Ngebut): ${JSON.stringify(inputUser2)}`);
  console.log(`-> Prediksi Cluster: ${result2.cluster}`);
  console.log(`-> Label: ${result2.result.label}`);
} catch (e) {
  console.log("Error:", e.message);
}