## **A. Generate Insight (Trigger AI Analysis)**

Endpoint ini digunakan untuk memicu proses analisis data pengguna oleh model TensorFlow dan menyimpan hasilnya. Ini dipanggil saat pengguna pertama kali masuk atau menekan tombol "Refresh Analysis".

| Detail | Deskripsi |
| :---- | :---- |
| **URL** | /v1/insight/generate |
| **Method** | POST |
| **Auth** | Wajib (Header: Authorization: Bearer \<token\>) |
| **Deskripsi** | Backend menarik data raw dari Supabase, menjalankan model TensorFlow, menyimpan hasilnya ke tabel user\_ai\_insights, dan mengembalikan hasilnya ke frontend. |

### **Request Body**

{  
  "user\_id": 3390  
}

**Catatan:** Jika token JWT sudah mengandung user\_id, *body* ini bersifat opsional. Namun, dapat disertakan untuk mode administrator.

### **Response (200 OK \- Success)**

{  
  "status": "success",  
  "message": "Insight generated successfully",  
  "data": {  
    "user\_id": 3390,  
    "learning\_label": "Reflective Learner",  
    "cluster\_group": 0,  
    "recommendation": "Kamu mendalami konsep dengan baik. Cobalah membuat ringkasan...",  
    "metrics": {  
      "materials\_per\_day": 15.8,  
      "avg\_rating": 4.5,  
      "completion\_rate": 98.9,  
      "total\_study\_hours": 7.9  
    },  
    "last\_updated": "2025-11-20T10:00:00Z"  
  }  
}

### **Response (404 Not Found \- Insufficient Data)**

Jika data *tracking* atau *submission* pengguna kosong (Pengguna baru).

{  
  "status": "error",  
  "message": "Insufficient data to generate insight. Please complete at least one module."  
}

## **B. Get User Insight (Read Only)**

Endpoint ini digunakan untuk membaca insight AI terakhir yang telah disimpan di database. Ini dipanggil setiap kali pengguna me-refresh halaman dashboard, memastikan prosesnya cepat tanpa menjalankan model AI.

| Detail | Deskripsi |
| :---- | :---- |
| **URL** | /v1/insight/{user\_id} |
| **Method** | GET |
| **Auth** | Wajib |
| **Deskripsi** | Mengambil data *insight* terakhir yang tersimpan di tabel user\_ai\_insights. |

### **Request Params**

| Parameter | Tipe | Contoh | Deskripsi |
| :---- | :---- | :---- | :---- |
| user\_id | Integer | 3390 | ID pengguna yang *insight*\-nya ingin diambil. |

### **Response (200 OK)**

{  
  "status": "success",  
  "data": {  
    "id": 1,  
    "user\_id": 3390,  
    "learning\_label": "Reflective Learner",  
    "cluster\_group": 0,  
    "metrics": {  
      "materials\_per\_day": 15.8,  
      "avg\_rating": 4.5,  
      "completion\_rate": 98.9  
    },  
    "recommendation": "Kamu termasuk Reflective Learner 🔍...",  
    "created\_at": "2025-11-20T09:00:00Z",  
    "updated\_at": "2025-11-20T10:00:00Z"  
  }  
}

## **C. Get Learning History (Chart Data)**

**Opsional:** Endpoint ini dapat digunakan untuk menampilkan data historis yang cocok untuk visualisasi grafik seperti "Progress Belajar Minggu Ini".

| Detail | Deskripsi |
| :---- | :---- |
| **URL** | /v1/insight/{user\_id}/history |
| **Method** | GET |
| **Auth** | Wajib |
| **Deskripsi** | Mengambil data progres mingguan yang bisa digunakan untuk membuat *chart*. |

### **Response (200 OK)**

{  
  "status": "success",  
  "data": {  
    "labels": \["Senin", "Selasa", "Rabu", "Kamis", "Jumat"\],  
    "datasets": \[  
      {  
        "label": "Materi Diselesaikan",  
        "data": \[2, 0, 5, 1, 3\]  
      },  
      {  
        "label": "Rata-rata Rating Tugas",  
        "data": \[5, 0, 4, 4, 5\]  
      }  
    \]  
  }  
}  
