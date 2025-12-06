const { Pool } = require("pg")

class ProgressService {
  constructor() {
    this._pool = new Pool()
  }

  async getUserProgress(userId) {
    const query = {
      text: `
        WITH 
        -- 1. Hitung Total Konten (Untuk Completion Rate)
        total_content AS (
          SELECT COUNT(*)::NUMERIC as total_available FROM developer_journey_tutorials
        ),

        -- 2. Hitung Tracking (Total, Weekly, Materials per Day)
        tracking_stats AS (
          SELECT 
            COUNT(djt.id) FILTER (WHERE djt.status = '1') as total_completed,
            -- Hitung Materi Minggu Ini
            COUNT(djt.id) FILTER (
                WHERE djt.status = '1' 
                AND NULLIF(djt.completed_at, '')::timestamp > CURRENT_DATE - INTERVAL '7 days'
            ) as completed_this_week,
            -- Hitung Hari Sejak Join
            EXTRACT(EPOCH FROM (NOW() - u.created_at)) / 86400 as days_joined
          FROM users u
          LEFT JOIN developer_journey_trackings djt ON u.id = djt.developer_id
          WHERE u.id = $1
          GROUP BY u.id, u.created_at
        ),

        -- 3. Hitung Submission (Rating, Success Rate)
        submission_stats AS (
          SELECT 
            COALESCE(AVG(NULLIF(rating, '')::NUMERIC), 0) as avg_rating,
            COUNT(id) as total_submit,
            COUNT(id) FILTER (WHERE status = 1) as passed_submit
          FROM developer_journey_submissions
          WHERE submitter_id = $1
        ),

        -- 4. Hitung Completion (Durasi Belajar)
        completion_stats AS (
          SELECT 
            COALESCE(SUM(study_duration), 0) as total_hours,
            COALESCE(AVG(study_duration), 0) as avg_duration_per_session
          FROM developer_journey_completions
          WHERE user_id = $1
        )

        -- 5. GABUNGKAN
        SELECT 
          ts.total_completed,
          ts.completed_this_week,
          ts.days_joined,
          ss.avg_rating,
          ss.total_submit,
          ss.passed_submit,
          cs.total_hours,
          cs.avg_duration_per_session,
          tc.total_available
        FROM tracking_stats ts
        CROSS JOIN submission_stats ss
        CROSS JOIN completion_stats cs
        CROSS JOIN total_content tc
      `,
      values: [userId],
    };

    const result = await this._pool.query(query);
    const data = result.rows[0];

    // --- RUMUS-RUMUS (Sama kayak di AI Features) ---

    // 1. Completion Rate
    const totalAvail = parseInt(data.total_available) || 1;
    const compRate = parseInt(data.total_completed) / totalAvail;

    // 2. Success Rate
    const totalSub = parseInt(data.total_submit);
    const successRate = totalSub === 0 ? 0 : parseInt(data.passed_submit) / totalSub;

    // 3. Time Per Material
    const totalComp = parseInt(data.total_completed);
    const timePerMat = totalComp === 0 ? 0 : parseFloat(data.total_hours) / totalComp;

    // 4. Materials Per Day
    const days = parseFloat(data.days_joined) < 1 ? 1 : parseFloat(data.days_joined);
    const matPerDay = totalComp / days;

    // Return Object Lengkap (Snake Case biar sama kayak JSON AI)
    return {
      total_material_completed: parseInt(data.total_completed),
      materials_completed_this_week: parseInt(data.completed_this_week), // Fitur tambahan khusus dashboard
      materials_per_day: parseFloat(matPerDay.toFixed(2)),
      total_study_hours: parseFloat(data.total_hours).toFixed(2),
      tutorial_completion_rate: parseFloat(compRate.toFixed(2)),
      avg_submission_rating: parseFloat(data.avg_rating).toFixed(2),
      submission_success_rate: parseFloat(successRate.toFixed(2)),
      avg_tutorial_duration: parseFloat(data.avg_duration_per_session).toFixed(2),
      study_time_per_material: parseFloat(timePerMat.toFixed(2))
    };
  }
}

module.exports = ProgressService