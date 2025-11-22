const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const InvariantError = require('../exception/InvariantError');

class InsightService {
    constructor() {
        this._pool = new Pool();
        this._modelCentroids = {}; // Tempat nyimpen "Otak" AI yang dipelajari dari JSON

        this._datasetPath = path.resolve(__dirname, '../../src/models/learning_insight_result.json');

        this._trainModelFromDataset();
    }

    // --- STEP 1: BACA JSON & HITUNG CENTROID (OTOMATIS) ---
    // --- VERSION: PRO (8 FEATURES TRAINER) ---
    _trainModelFromDataset() {
        try {
            console.log(`⏳ Membaca dataset dari: ${this._datasetPath}`);
            const rawData = fs.readFileSync(this._datasetPath, 'utf-8');
            const dataset = JSON.parse(rawData);

            const clusterGroups = {};

            dataset.forEach(user => {
                const cluster = user.cluster;

                if (!clusterGroups[cluster]) {
                    clusterGroups[cluster] = {
                        count: 0,
                        // Siapkan penampung untuk 8 Fitur
                        sumTotalMat: 0,
                        sumMatPerDay: 0,
                        sumStudyTime: 0,
                        sumCompRate: 0,
                        sumAvgRating: 0,
                        sumSuccessRate: 0,
                        sumAvgDur: 0,
                        sumTimePerMat: 0,
                        // Metadata
                        label: user.learning_label,
                        recommendation: user.recommendation
                    };
                }

                const g = clusterGroups[cluster];
                g.count += 1;

                // Jumlahkan ke-8 Fitur dari JSON
                g.sumTotalMat += (user.total_material_completed || 0);
                g.sumMatPerDay += (user.materials_per_day || 0);
                g.sumStudyTime += (user.total_study_time || 0);
                g.sumCompRate += (user.tutorial_completion_rate || 0);
                g.sumAvgRating += (user.avg_submission_rating_journey || 0);
                g.sumSuccessRate += (user.submission_success_rate || 0);
                g.sumAvgDur += (user.avg_tutorial_duration || 0);
                g.sumTimePerMat += (user.study_time_per_material || 0);
            });

            // Hitung Rata-rata (Centroid)
            for (const key in clusterGroups) {
                const group = clusterGroups[key];
                this._modelCentroids[key] = {
                    // PENTING: Urutan ini HARUS SAMA PERSIS dengan return di _getUserFeatures
                    centroid: [
                        group.sumTotalMat / group.count,      // 1. total_material_completed
                        group.sumMatPerDay / group.count,     // 2. materials_per_day
                        group.sumStudyTime / group.count,     // 3. total_study_time
                        group.sumCompRate / group.count,      // 4. tutorial_completion_rate
                        group.sumAvgRating / group.count,     // 5. avg_submission_rating
                        group.sumSuccessRate / group.count,   // 6. submission_success_rate
                        group.sumAvgDur / group.count,        // 7. avg_tutorial_duration
                        group.sumTimePerMat / group.count     // 8. study_time_per_material
                    ],
                    label: group.label,
                    recommendation: group.recommendation
                };
            }

            console.log("✅ [AI PRO] Model 8 Fitur berhasil dilatih!");

        } catch (error) {
            console.error("❌ [AI] Gagal membaca dataset:", error.message);
            this._modelCentroids = {};
        }
    }

    // --- STEP 2: KLASIFIKASI USER BARU ---
    classifyUser(features) {

        // Cek kalau model kosong
        if (Object.keys(this._modelCentroids).length === 0) {
            throw new Error("Model belum siap (Dataset JSON tidak ditemukan/kosong).");
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
            result: this._modelCentroids[bestCluster]
        };
    }

    _calculateEuclideanDistance(point1, point2) {
        return Math.sqrt(
            point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0)
        );
    }

    // --- STEP 3: AMBIL DATA REAL DARI DB ---
    // --- VERSION: PRO (8 FEATURES) ---
    async _getUserFeatures(userId) {
        const query = {
            text: `
        WITH 
        -- 1. Hitung Total Tutorial yang Tersedia (Untuk Rate Kelulusan)
        total_content AS (
          SELECT COUNT(*)::NUMERIC as total_available FROM developer_journey_tutorials
        ),

        -- 2. Hitung Data Tracking (Materi Selesai & Hari Gabung)
        tracking_stats AS (
          SELECT 
            COUNT(djt.id) FILTER (WHERE djt.status = '1') as total_completed, -- Pakai status=1 sesuai DB kamu
            EXTRACT(EPOCH FROM (NOW() - u.created_at)) / 86400 as days_joined -- Hitung selisih hari (detik -> hari)
          FROM users u
          LEFT JOIN developer_journey_trackings djt ON u.id = djt.developer_id
          WHERE u.id = $1
          GROUP BY u.id, u.created_at
        ),

        -- 3. Hitung Data Durasi Belajar (Waktu Belajar)
        completion_stats AS (
          SELECT 
            COALESCE(SUM(study_duration), 0) as total_hours,
            COALESCE(AVG(study_duration), 0) as avg_duration_per_session
          FROM developer_journey_completions
          WHERE user_id = $1
        ),

        -- 4. Hitung Data Submission (Rating & Success Rate)
        submission_stats AS (
          SELECT 
            COALESCE(AVG(NULLIF(rating, '')::NUMERIC), 0) as avg_rating,
            COUNT(*) as total_submit,
            COUNT(*) FILTER (WHERE status = 1) as passed_submit -- Asumsi status=1 itu LULUS/PASSED
          FROM developer_journey_submissions
          WHERE submitter_id = $1
        )

        -- 5. GABUNGKAN SEMUANYA
        SELECT 
          ts.total_completed,
          ts.days_joined,
          cs.total_hours,
          cs.avg_duration_per_session,
          ss.avg_rating,
          ss.total_submit,
          ss.passed_submit,
          tc.total_available
        FROM tracking_stats ts
        CROSS JOIN completion_stats cs
        CROSS JOIN submission_stats ss
        CROSS JOIN total_content tc
      `,
            values: [userId],
        };

        const res = await this._pool.query(query);
        const data = res.rows[0];

        // Jika user tidak ditemukan / data kosong
        if (!data || parseInt(data.total_completed) === 0) {
            return null;
        }

        // --- PERHITUNGAN RUMUS (POST-PROCESSING) ---

        // 1. Materials Per Day
        // Cegah pembagian nol. Minimal 1 hari.
        const days = parseFloat(data.days_joined) < 1 ? 1 : parseFloat(data.days_joined);
        const materialsPerDay = parseInt(data.total_completed) / days;

        // 2. Tutorial Completion Rate (Selesai / Total Tersedia)
        const totalAvail = parseInt(data.total_available) || 1; // Cegah bagi 0
        const completionRate = parseInt(data.total_completed) / totalAvail;

        // 3. Submission Success Rate (Lulus / Total Submit)
        const totalSub = parseInt(data.total_submit);
        const successRate = totalSub === 0 ? 0 : parseInt(data.passed_submit) / totalSub;

        // 4. Study Time Per Material (Total Jam / Total Materi)
        const totalComp = parseInt(data.total_completed);
        const timePerMaterial = totalComp === 0 ? 0 : parseFloat(data.total_hours) / totalComp;

        // --- RETURN ARRAY 8 FITUR ---
        // Urutan HARUS SAMA PERSIS dengan urutan kolom di file JSON (learning_insight_result.json)
        // Cek header CSV/JSON kamu untuk memastikan urutannya.

        return [
            parseInt(data.total_completed),     // 1. total_material_completed
            materialsPerDay,                    // 2. materials_per_day
            parseFloat(data.total_hours),       // 3. total_study_time
            completionRate,                     // 4. tutorial_completion_rate
            parseFloat(data.avg_rating),        // 5. avg_submission_rating_journey
            successRate,                        // 6. submission_success_rate
            parseFloat(data.avg_duration_per_session), // 7. avg_tutorial_duration
            timePerMaterial                     // 8. study_time_per_material
        ];
    }

    async generateInsight(userId) {
        if (Object.keys(this._modelCentroids).length === 0) {
            this._trainModelFromDataset();
        }

        const features = await this._getUserFeatures(userId);

        if (!features) {
            throw new InvariantError('User not found or no data');
        }

        const aiResult = this.classifyUser(features);


        const metricsJson = {
            total_material_completed: features[0],
            materialsPerDay: features[1],
            total_study_time: features[2],
            tutorial_completion_rate: features[3],
            avg_submission_rating_journey: features[4],
            submission_success_rate: features[5],
            avg_tutorial_duration: features[6],
            study_time_per_material: features[7]
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
                metricsJson
            ],
        };

        const result = await this._pool.query(queryInsert);
        return result.rows[0];
    }
    async getInsightByUserId(userId) {
        const query = {
            text: 'SELECT * FROM user_ai_insights WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            values: [userId]
        }
        const result = await this._pool.query(query);
        
        if (!result.rows.length) {
            throw new InvariantError('Learning insight untuk user tidak ada');
        }

        return result.rows[0];
    }
}

module.exports = InsightService;