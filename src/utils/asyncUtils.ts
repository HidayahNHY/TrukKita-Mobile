// ======================================================
// ASYNCHRONOUS UTILS - MODUL 3
// PROMISE, RESOLVE, REJECT, THEN, ASYNC, AWAIT
// ======================================================

// 1. Membuat Promise sendiri
export const cekKoneksiAPI = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const berhasil = true;

      if (berhasil) {
        resolve("Koneksi API berhasil!");
      } else {
        reject(new Error("Koneksi API gagal!"));
      }
    }, 1000);
  });
};

// 2. Menggunakan Promise.resolve()
export const contohResolve = (): Promise<string> => {
  return Promise.resolve("Promise berhasil diselesaikan!");
};

// 3. Menggunakan Promise.reject()
export const contohReject = (): Promise<string> => {
  return Promise.reject(new Error("Promise mengalami kegagalan!"));
};

// 4. Menggunakan .then() dan .catch()
export const ujiPromiseThen = (): void => {
  cekKoneksiAPI()
    .then((hasil) => {
      console.log("Hasil .then():", hasil);
    })
    .catch((error: Error) => {
      console.error("Hasil .catch():", error.message);
    });
};

// 5. Menggunakan async dan await
export const ujiAsyncAwait = async (): Promise<void> => {
  try {
    const hasil = await cekKoneksiAPI();

    console.log("Hasil async/await:", hasil);
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
};