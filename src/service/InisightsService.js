const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const InvariantError = require("../exception/InvariantError");

class InsightService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      family: 4,
    });
    
    this._modelCentroids = {}; // Tempat nyimpen "Otak" AI yang dipelajari dari JSON

    this._datasetPath = path.resolve(
      __dirname,
      "../../src/models/learning_insight_result.json",
    );

    this._trainModelFromDataset();
  }

  // --- STEP 1: BACA JSON & HITUNG CENTROID (OTOMATIS) ---
  _trainModelFromDataset() {
    try {
      console.log(`⏳ Membaca dataset dari: ${this._datasetPath}`);
      const rawData = fs.readFileSync(this._datasetPath, "utf-8");
      const dataset = JSON.parse(rawData);

      // Kita butuh penampung sementara untuk menjumlahkan nilai fitur per cluster
      // Format: { 0: { totalMaterials: 100, count: 5, ... }, 1: ... }
      const clusterGroups = {};

      dataset.forEach((user) => {
        const cluster = user.cluster;

        if (!clusterGroups[cluster]) {
          clusterGroups[cluster] = {
            count: 0,
            // Akumulator untuk fitur-fitur numerik yang mau dijadikan patokan
            sumMaterialsPerDay: 0,
            sumAvgRating: 0,
            sumStudyTime: 0,
            // Simpan template label & rekomendasi dari data sample pertama aja
            label: user.learning_label,
            recommendation: user.recommendation,
          };
        }

        // Jumlahkan nilai fiturnya
        clusterGroups[cluster].count += 1;
        clusterGroups[cluster].sumMaterialsPerDay +=
          user.materials_per_day || 0;
        clusterGroups[cluster].sumAvgRating +=
          user.avg_submission_rating_journey || 0;
        clusterGroups[cluster].sumStudyTime += user.total_study_time || 0;
      });

      // Hitung RATA-RATA (Centroid) untuk setiap cluster
      for (const key in clusterGroups) {
        const group = clusterGroups[key];
        this._modelCentroids[key] = {
          // Urutan Array Centroid: [materials_per_day, avg_rating, study_time]
          centroid: [
            group.sumMaterialsPerDay / group.count,
            group.sumAvgRating / group.count,
            group.sumStudyTime / group.count,
          ],
          label: group.label,
          recommendation: group.recommendation,
        };
      }

      console.log("✅ [AI] Model berhasil dilatih dari file JSON!");
      console.log(
        "   -> Centroids terbentuk:",
        Object.keys(this._modelCentroids).length,
        "Clusters",
      );
    } catch (error) {
      console.error("❌ [AI] Gagal membaca dataset:", error.message);
      // Fallback dummy biar server gak crash kalau file gak ketemu
      this._modelCentroids = {};
    }
  }

  // --- STEP 2: KLASIFIKASI USER BARU ---
  classifyUser(features) {
    // features: [materials_per_day, avg_rating, study_time]

    // Cek kalau model kosong
    if (Object.keys(this._modelCentroids).length === 0) {
      throw new Error(
        "Model belum siap (Dataset JSON tidak ditemukan/kosong).",
      );
    }

    let minDistance = Infinity;
    let bestCluster = -1;

    for (const clusterId in this._modelCentroids) {
      const centroid = this._modelCentroids[clusterId].centroid;
      const distance = this._calculateEuclideanDistance(features, centroid);

      if (distance < minDistance) {
        minDistance = distance;
        bestCluster = clusterId;
      }
    }

    return {
      cluster: parseInt(bestCluster),
      result: this._modelCentroids[bestCluster],
    };
  }

  _calculateEuclideanDistance(point1, point2) {
    return Math.sqrt(
      point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0),
    );
  }

  // --- STEP 3: AMBIL DATA REAL DARI DB ---
  async _getUserFeatures(userId) {
    // A. Ambil Data Durasi Belajar (Total Study Time)
    // Asumsi: study_duration ada di tabel completions
    const queryTime = {
      text: `SELECT COALESCE(SUM(study_duration), 0) as total_time
             FROM developer_journey_completions WHERE user_id = $1`,
      values: [userId],
    };

    // B. Ambil Data Rating Tugas (Avg Rating)
    // Kita perlu cast rating (text) ke numeric.
    const queryRating = {
      text: `SELECT COALESCE(AVG(NULLIF(rating, '')::NUMERIC), 0) as avg_rating
             FROM developer_journey_submissions WHERE submitter_id = $1`,
      values: [userId],
    };

    // C. Ambil Data Progres & Tanggal Gabung (Materials per Day)
    // Kita butuh created_at user untuk hitung sudah berapa hari dia gabung
    const queryTracking = {
      text: `SELECT
               COUNT(djt.id) FILTER (WHERE djt.status = 'completed') as completed_materials,
               u.created_at as join_date
             FROM users u
             LEFT JOIN developer_journey_trackings djt ON u.id = djt.developer_id
             WHERE u.id = $1
             GROUP BY u.id`,
      values: [userId],
    };

    // Jalankan semua query secara paralel (biar cepat)
    const [resTime, resRating, resTrack] = await Promise.all([
      this._pool.query(queryTime),
      this._pool.query(queryRating),
      this._pool.query(queryTracking),
    ]);

    const dataTime = resTime.rows[0];
    const dataRating = resRating.rows[0];
    const dataTrack = resTrack.rows[0];

    // Validasi: Kalau user tidak ditemukan
    if (!dataTrack) {
      return null; // User tidak ada
    }

    // --- HITUNG LOGIKA MATERIALS PER DAY ---
    const totalMaterials = parseInt(dataTrack.completed_materials || 0);
    const avgRating = parseFloat(dataRating.avg_rating || 0);
    const totalTime = parseFloat(dataTime.total_time || 0);

    // Hitung selisih hari (Sekarang - Tanggal Join)
    const joinDate = new Date(dataTrack.join_date);
    const now = new Date();
    const diffTime = Math.abs(now - joinDate);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) diffDays = 1;

    const materialsPerDay = totalMaterials / diffDays;

    return [materialsPerDay, avgRating, totalTime];
  }

  async checkInsightExists(userId) {
    const query = {
      text: `
            SELECT id
            FROM user_ai_insights
            WHERE user_id = $1
              AND created_at::date = CURRENT_DATE
            LIMIT 1
          `,
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      return true;
    }

    return false;
  }

  async generateInsight(userId) {
    const alreadyGenerate = await this.checkInsightExists(userId);

    if (alreadyGenerate) {
      throw new Error("DAILY_LIMIT_REACHED");
    }

    if (Object.keys(this._modelCentroids).length === 0) {
      this._trainModelFromDataset();
    }

    const features = await this._getUserFeatures(userId);

    if (!features) {
      throw new Error("User not found or no data");
    }

    const aiResult = this.classifyUser(features);

    const metricsJson = {
      materials_per_day: features[0],
      avg_rating: features[1],
      total_study_hours: features[2],
    };

    const queryInsert = {
      text: `
        INSERT INTO user_ai_insights
        (user_id, learning_label, cluster_group, recommendation, metrics, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *
      `,
      values: [
        userId,
        aiResult.result.label,
        aiResult.cluster,
        aiResult.result.recommendation,
        metricsJson,
      ],
    };

    const result = await this._pool.query(queryInsert);
    return result.rows[0];
  }
  async getInsightByUserId(userId) {
    const query = {
      text: "SELECT * FROM user_ai_insights WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      values: [userId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Learning insight untuk user tidak ada");
    }

    return result.rows[0];
  }
}

module.exports = InsightService;
