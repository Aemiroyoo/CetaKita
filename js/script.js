/* =========================================================
   CETAKITA V2 — INTERACTION & ANIMATION
   ========================================================= */


/* =========================================================
   MOBILE NAVBAR
   ========================================================= */

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.querySelector(".nav-menu");

if (menuToggle && navMenu) {

    menuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");

        // Ubah icon menu
        if (navMenu.classList.contains("active")) {
            menuToggle.textContent = "✕";
        } else {
            menuToggle.textContent = "☰";
        }
    });


    // Tutup menu ketika link diklik
    const navLinks = document.querySelectorAll(".nav-menu a");

    navLinks.forEach(link => {

        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
            menuToggle.textContent = "☰";
        });

    });

}


/* =========================================================
   NAVBAR SAAT SCROLL
   ========================================================= */

const navbar = document.querySelector(".navbar");

function updateNavbar() {

    if (!navbar) return;

    if (window.scrollY > 20) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }

}

window.addEventListener("scroll", updateNavbar);

updateNavbar();


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

const revealElements = document.querySelectorAll(
    ".section-heading, .service-card, .price-card, .benefit, .process-step, .process-info-item, .process-cta, .location-card, .location-header, .cta-card, .cta-content, .cta-action, .estimator-box, .estimator-note"
);

revealElements.forEach(element => {
    element.classList.add("reveal");
});


const revealObserver = new IntersectionObserver(
    (entries, observer) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

                observer.unobserve(entry.target);

            }

        });

    },
    {
        threshold: 0.12
    }
);


revealElements.forEach(element => {
    revealObserver.observe(element);
});


/* =========================================================
   STAGGER ANIMATION
   Biar card muncul satu per satu
   ========================================================= */

const cardGroups = [
    ".service-grid .service-card",
    ".price-grid .price-card",
    ".benefits-grid .benefit",
    ".process-timeline .process-step",
    ".process-info .process-info-item"
];


cardGroups.forEach(selector => {

    const cards = document.querySelectorAll(selector);

    cards.forEach((card, index) => {

        card.style.transitionDelay =
            `${index * 0.08}s`;

    });

});


/* =========================================================
   SMOOTH ANCHOR
   ========================================================= */

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function (event) {

        const targetId =
            this.getAttribute("href");

        if (targetId === "#") return;

        const target =
            document.querySelector(targetId);

        if (!target) return;

        event.preventDefault();

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

});


/* =========================================================
   BUTTON PRESS MICRO INTERACTION
   ========================================================= */

document.querySelectorAll(
    ".hero-buttons a, .cta-card a"
).forEach(button => {

    button.addEventListener("mousedown", () => {
        button.style.transform = "scale(0.97)";
    });

    button.addEventListener("mouseup", () => {
        button.style.transform = "";
    });

    button.addEventListener("mouseleave", () => {
        button.style.transform = "";
    });

});


/* =========================================================
   PRICE ESTIMATOR
   ========================================================= */


/* =========================================================
   HARGA CETAK NORMAL
   ========================================================= */

const estimatorPrices = {

    black: 500,

    light: 1000,

    medium: 1500,

    full: 2500

};


/* =========================================================
   HARGA PAKET HEMAT
   KHUSUS HITAM PUTIH
   ========================================================= */

const packagePrices = {

    20: 9500,

    50: 24000,

    100: 48000,

    150: 72000

};


/* =========================================================
   HARGA PAKET + ONGKIR
   KHUSUS INFORMASI PAKET
   TIDAK DIGUNAKAN OTOMATIS DI ESTIMATOR
   ========================================================= */

const packageShippingPrices = {

    50: 34000,

    100: 57000,

    150: 80000

};


/* =========================================================
   JUMLAH CETAKAN
   ========================================================= */

const estimatorCounts = {

    black: 0,

    light: 0,

    medium: 0,

    full: 0

};


/* =========================================================
   ELEMENTS
   ========================================================= */

const estimatorTotal =
    document.getElementById("estimatorTotal");


const estimatorPageTotal =
    document.getElementById("estimatorPageTotal");


const estimatorWhatsapp =
    document.getElementById("estimatorWhatsapp");


const estimatorSummary =
    document.querySelector(".estimator-summary");


/* =========================================================
   FORMAT RUPIAH
   ========================================================= */

function formatRupiah(number) {

    return new Intl.NumberFormat("id-ID", {

        style: "currency",

        currency: "IDR",

        minimumFractionDigits: 0

    }).format(number);

}


/* =========================================================
   GET HARGA PAKET
   ========================================================= */

function getPackagePrice(pages) {

    return packagePrices[pages] || null;

}


function getPackageShippingPrice(pages) {

    return packageShippingPrices[pages] || null;

}


/* =========================================================
   HITUNG PAKET B&W PALING HEMAT
   =========================================================
   
   Aturan:
   
   - Hanya Hitam Putih
   - Paket:
       20  = Rp9.500
       50  = Rp24.000
       100 = Rp48.000
       150 = Rp72.000
   - Sisa halaman menggunakan harga normal
       Rp500 / lembar
   - Sistem membandingkan semua kemungkinan
     kombinasi paket untuk mencari harga termurah.
   
   Contoh:
   
   50 B&W
   = Rp24.000
   
   100 B&W
   = Rp48.000
   
   150 B&W
   = Rp72.000
   
   10 B&W
   = 10 × Rp500
   = Rp5.000
   
   ========================================================= */

function calculateBestBlackWhitePrice(pages) {

    if (pages <= 0) {

        return {
            total: 0,
            details: []
        };

    }


    const packageOptions = [
        {
            pages: 20,
            price: getPackagePrice(20)
        },
        {
            pages: 50,
            price: getPackagePrice(50)
        },
        {
            pages: 100,
            price: getPackagePrice(100)
        },
        {
            pages: 150,
            price: getPackagePrice(150)
        }
    ];


    /*
     * dp[i] = harga termurah untuk mencetak
     * sebanyak i lembar B&W.
     */

    const dp = new Array(pages + 1).fill(Infinity);

    const choices = new Array(pages + 1).fill(null);


    /*
     * 0 lembar = Rp0
     */

    dp[0] = 0;


    /*
     * Hitung harga termurah.
     *
     * Setiap halaman bisa:
     * - menggunakan harga normal Rp500
     * - menggunakan salah satu paket hemat
     */

    for (let i = 1; i <= pages; i++) {

        /*
         * Opsi 1:
         * 1 lembar harga normal
         */

        const normalPrice =
            dp[i - 1] +
            estimatorPrices.black;


        dp[i] = normalPrice;

        choices[i] = {
            type: "normal",
            pages: 1,
            price: estimatorPrices.black
        };


        /*
         * Opsi 2:
         * Gunakan paket
         */

        packageOptions.forEach(option => {

            if (i >= option.pages) {

                const packageTotal =
                    dp[i - option.pages] +
                    option.price;


                if (packageTotal < dp[i]) {

                    dp[i] = packageTotal;

                    choices[i] = {
                        type: "package",
                        pages: option.pages,
                        price: option.price
                    };

                }

            }

        });

    }


    /*
     * Rekonstruksi kombinasi paket
     */

    let remaining = pages;

    const packageCounts = {

        20: 0,

        50: 0,

        100: 0,

        150: 0

    };


    let normalPages = 0;


    while (remaining > 0) {

        const choice =
            choices[remaining];


        if (!choice) {
            break;
        }


        if (choice.type === "package") {

            packageCounts[choice.pages]++;

            remaining -= choice.pages;

        } else {

            normalPages++;

            remaining--;

        }

    }


    /*
     * Buat detail paket
     */

    const details = [];


    if (packageCounts[150] > 0) {

        details.push({
            type: "package",
            pages: 150,
            quantity: packageCounts[150],
            price: packageCounts[150] * packagePrices[150]
        });

    }


    if (packageCounts[100] > 0) {

        details.push({
            type: "package",
            pages: 100,
            quantity: packageCounts[100],
            price: packageCounts[100] * packagePrices[100]
        });

    }


    if (packageCounts[50] > 0) {

        details.push({
            type: "package",
            pages: 50,
            quantity: packageCounts[50],
            price: packageCounts[50] * packagePrices[50]
        });

    }


    if (packageCounts[20] > 0) {

        details.push({
            type: "package",
            pages: 20,
            quantity: packageCounts[20],
            price: packageCounts[20] * packagePrices[20]
        });

    }


    /*
     * Sisa halaman harga normal
     */

    if (normalPages > 0) {

        details.push({
            type: "normal",
            pages: normalPages,
            quantity: normalPages,
            price:
                normalPages *
                estimatorPrices.black
        });

    }


    return {

        total: dp[pages],

        details: details

    };

}


/* =========================================================
   BUAT TEKS DETAIL PAKET B&W
   ========================================================= */

function getBlackWhitePackageText(details) {

    if (!details || details.length === 0) {

        return "";

    }


    const textParts = [];


    details.forEach(item => {

        if (item.type === "package") {

            textParts.push(
                `${item.quantity} × ${item.pages} lembar`
            );

        }


        if (item.type === "normal") {

            textParts.push(
                `${item.quantity} lembar harga normal`
            );

        }

    });


    return textParts.join(" + ");

}

/* =========================================================
   PACKAGE DISCOUNT NOTIFICATION
   ========================================================= */

function updatePackageDiscountNotice(blackPages, blackPackagePrice) {

    const notice =
        document.getElementById("packageDiscountNotice");

    const title =
        document.getElementById("packageDiscountTitle");

    const text =
        document.getElementById("packageDiscountText");

    if (!notice || !title || !text) return;


    /* Reset */

    notice.classList.remove("show");
    notice.classList.remove("discount-active");


    /* Tidak ada hitam putih */

    if (blackPages <= 0) {

        title.textContent = "Paket Hemat Hitam Putih";

        text.textContent =
            "Gunakan lebih banyak lembar hitam putih untuk mendapatkan harga Paket Hemat.";

        setTimeout(() => {
            notice.classList.add("show");
        }, 30);

        return;
    }


    /* Harga normal */

    const normalPrice =
        blackPages * estimatorPrices.black;


    /* Besarnya penghematan */

    const savings =
        normalPrice - blackPackagePrice;


    /* =====================================================
       SUDAH MENDAPAT PAKET HEMAT
       ===================================================== */

    if (savings > 0) {

        title.textContent =
            "🎉 Paket Hemat aktif!";

        text.textContent =
            `Kamu hemat ${formatRupiah(savings)} untuk ${blackPages} lembar hitam putih.`;

        notice.classList.add("discount-active");

        setTimeout(() => {
            notice.classList.add("show");
        }, 30);

        return;
    }


    /* =====================================================
       BELUM DAPAT PAKET — CARI TARGET BERIKUTNYA
       ===================================================== */

    const packageTargets = [20, 50, 100, 150];

    let nextTarget = null;

    for (const target of packageTargets) {

        if (blackPages < target) {
            nextTarget = target;
            break;
        }
    }


    /* Kalau sudah di atas 150 */

    if (!nextTarget) {

        title.textContent =
            "💡 Paket Hemat tetap aktif";

        text.textContent =
            "Jumlah hitam putih kamu sudah melewati seluruh target paket.";

        setTimeout(() => {
            notice.classList.add("show");
        }, 30);

        return;
    }


    const remaining =
        nextTarget - blackPages;


    title.textContent =
        "💡 Bisa lebih hemat!";

    text.textContent =
        `Tambah ${remaining} lembar hitam putih lagi untuk mencapai Paket Hemat ${nextTarget} lembar.`;

    setTimeout(() => {
        notice.classList.add("show");
    }, 30);
}


/* =========================================================
   UPDATE SUMMARY
   ========================================================= */

function updateEstimatorSummary(totalPages) {

    const summaryBlack =
        document.getElementById("summaryBlack");


    const summaryLight =
        document.getElementById("summaryLight");


    const summaryMedium =
        document.getElementById("summaryMedium");


    const summaryFull =
        document.getElementById("summaryFull");


    if (summaryBlack) {

        summaryBlack.textContent =
            estimatorCounts.black;

    }


    if (summaryLight) {

        summaryLight.textContent =
            estimatorCounts.light;

    }


    if (summaryMedium) {

        summaryMedium.textContent =
            estimatorCounts.medium;

    }


    if (summaryFull) {

        summaryFull.textContent =
            estimatorCounts.full;

    }


    if (estimatorPageTotal) {

        estimatorPageTotal.textContent =
            `${totalPages} lembar`;

    }


    /*
     * Summary aktif jika ada halaman
     */

    if (estimatorSummary) {

        estimatorSummary.classList.toggle(
            "has-items",
            totalPages > 0
        );

    }


    /*
     * Tandai breakdown kosong
     */

    const breakdownMap = {

        black: ".black-breakdown",

        light: ".light-breakdown",

        medium: ".medium-breakdown",

        full: ".full-breakdown"

    };


    Object.keys(breakdownMap).forEach(type => {

        const element =
            document.querySelector(
                breakdownMap[type]
            );


        if (!element) return;


        element.classList.toggle(
            "empty",
            estimatorCounts[type] === 0
        );

    });

}


/* =========================================================
   UPDATE ACTIVE CARD
   ========================================================= */

function updateEstimatorCards() {

    Object.keys(estimatorCounts).forEach(type => {

        const card =
            document.querySelector(
                `.estimator-item[data-type="${type}"]`
            );


        if (!card) return;


        card.classList.toggle(
            "active",
            estimatorCounts[type] > 0
        );

    });

}


/* =========================================================
   UPDATE PRICE
   ========================================================= */

function updateEstimator() {

    let total = 0;

    let totalPages = 0;


    /*
     * ==========================================
     * HITAM PUTIH
     * ==========================================
     *
     * Gunakan Paket Hemat jika lebih murah.
     */

    const blackPages =
        estimatorCounts.black || 0;


    let blackTotal = 0;

    let blackPackageText = "";


    if (blackPages > 0) {

        const blackResult =
            calculateBestBlackWhitePrice(
                blackPages
            );

        blackTotal =
            blackResult.total;

        blackPackageText =
            getBlackWhitePackageText(
                blackResult.details
            );

        total += blackTotal;

        totalPages += blackPages;

    }


    /* NOTIFIKASI PAKET HEMAT */

    updatePackageDiscountNotice(
        blackPages,
        blackTotal
    );


    /*
     * ==========================================
     * WARNA
     * ==========================================
     *
     * Warna TIDAK menggunakan Paket Hemat.
     *
     * Warna Ringan  = Rp1.000
     * Warna Sedang  = Rp1.500
     * Full Color    = Rp2.500
     */

    Object.keys(estimatorCounts).forEach(type => {

        if (type === "black") {
            return;
        }


        const quantity =
            estimatorCounts[type];


        total +=
            quantity *
            estimatorPrices[type];


        totalPages += quantity;

    });


    /*
     * ==========================================
     * UPDATE COUNTER
     * ==========================================
     */

    Object.keys(estimatorCounts).forEach(type => {

        const quantity =
            estimatorCounts[type];


        const counter =
            document.getElementById(
                `${type}Count`
            );


        if (counter) {

            counter.textContent =
                quantity;

        }

    });


    /*
     * ==========================================
     * TOTAL HARGA
     * ==========================================
     */

    if (estimatorTotal) {

        estimatorTotal.textContent =
            formatRupiah(total);


        /*
         * Animasi perubahan harga
         */

        estimatorTotal.classList.remove(
            "price-update"
        );


        void estimatorTotal.offsetWidth;


        estimatorTotal.classList.add(
            "price-update"
        );

    }


    /*
     * ==========================================
     * TOTAL HALAMAN + BREAKDOWN
     * ==========================================
     */

    updateEstimatorSummary(
        totalPages
    );


    /*
     * ==========================================
     * ACTIVE CARD
     * ==========================================
     */

    updateEstimatorCards();


    /*
     * ==========================================
     * WHATSAPP
     * ==========================================
     */

    updateWhatsappLink(
        total,
        totalPages,
        blackTotal,
        blackPackageText
    );

}


/* =========================================================
   WHATSAPP MESSAGE
   ========================================================= */

function updateWhatsappLink(
    total,
    totalPages,
    blackTotal = 0,
    blackPackageText = ""
) {

    if (!estimatorWhatsapp) return;


    const labels = {

        black: "⚫ Hitam Putih",

        light: "🟢 Warna Ringan",

        medium: "🟡 Warna Sedang",

        full: "🌈 Full Color"

    };


    const selectedItems = [];


    Object.keys(estimatorCounts).forEach(type => {

        const quantity =
            estimatorCounts[type];


        /*
         * Hanya tampilkan yang jumlahnya > 0
         */

        if (quantity > 0) {

            selectedItems.push(
                `${labels[type]}: ${quantity} lembar`
            );

        }

    });


    let message =
        `Halo CetaKita 👋\n\n` +
        `Saya ingin print dengan rincian:\n\n`;


    /*
     * Jika belum ada halaman
     */

    if (selectedItems.length === 0) {

        message +=
            `Saya belum menentukan jumlah halaman.\n\n`;

    } else {

        message +=
            selectedItems.join("\n") +
            `\n\n`;


        /*
         * Detail Paket Hemat B&W
         */

        if (
            estimatorCounts.black > 0 &&
            blackPackageText
        ) {

            message +=
                `📦 Paket Hemat B&W:\n` +
                `${blackPackageText}\n` +
                `💵 Harga B&W: ${formatRupiah(blackTotal)}\n\n`;

        }


        message +=
            `📄 Total: ${totalPages} lembar\n` +
            `💰 Perkiraan: ${formatRupiah(total)}\n\n`;

    }


    message +=
        `Mohon dibantu cek dan konfirmasi ya.\n` +
        `Terima kasih 🙏`;


    estimatorWhatsapp.href =
        `https://wa.me/6289651815986?text=${encodeURIComponent(message)}`;

}


/* =========================================================
   COUNTER BUTTON
   ========================================================= */

document.querySelectorAll(".counter-btn").forEach(button => {

    button.addEventListener("click", () => {

        const target =
            button.dataset.target;


        if (!target) return;


        if (
            !Object.prototype.hasOwnProperty.call(
                estimatorCounts,
                target
            )
        ) {

            return;

        }


        /*
         * PLUS
         */

        if (
            button.classList.contains("plus")
        ) {

            estimatorCounts[target]++;

        }


        /*
         * MINUS
         */

        if (
            button.classList.contains("minus")
        ) {

            if (
                estimatorCounts[target] > 0
            ) {

                estimatorCounts[target]--;

            }

        }


        /*
         * Update semuanya
         */

        updateEstimator();

    });

});

/* =========================================================
   INPUT JUMLAH LEMBAR
   Klik angka untuk memasukkan jumlah langsung
   ========================================================= */

const quantityModal =
    document.getElementById("quantityModal");

const quantityInput =
    document.getElementById("quantityInput");

const quantityModalTitle =
    document.getElementById("quantityModalTitle");

const quantityModalClose =
    document.getElementById("quantityModalClose");

const quantityModalCancel =
    document.getElementById("quantityModalCancel");

const quantityModalConfirm =
    document.getElementById("quantityModalConfirm");

const quantityModalOverlay =
    document.querySelector(".quantity-modal-overlay");


let activeQuantityType = null;


/* =========================================================
   BUKA MODAL
   ========================================================= */

function openQuantityModal(type) {

    if (!quantityModal) return;

    if (
        !Object.prototype.hasOwnProperty.call(
            estimatorCounts,
            type
        )
    ) {
        return;
    }


    activeQuantityType = type;


    const typeNames = {
        black: "Hitam Putih",
        light: "Warna Ringan",
        medium: "Warna Sedang",
        full: "Full Color"
    };


    if (quantityModalTitle) {

        quantityModalTitle.textContent =
            typeNames[type] || "Jumlah lembar";

    }


    if (quantityInput) {

        quantityInput.value =
            estimatorCounts[type];

        quantityInput.select();

    }


    quantityModal.classList.add("active");

    quantityModal.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
     * Fokus ke input agar keyboard HP
     * langsung muncul.
     */

    setTimeout(() => {

        if (quantityInput) {

            quantityInput.focus();

            quantityInput.select();

        }

    }, 100);

}


/* =========================================================
   TUTUP MODAL
   ========================================================= */

function closeQuantityModal() {

    if (!quantityModal) return;


    quantityModal.classList.remove("active");

    quantityModal.setAttribute(
        "aria-hidden",
        "true"
    );


    activeQuantityType = null;

}


/* =========================================================
   TERAPKAN JUMLAH
   ========================================================= */

function applyQuantity() {

    if (!activeQuantityType) return;

    if (!quantityInput) return;


    let quantity =
        parseInt(
            quantityInput.value,
            10
        );


    /*
     * Kalau kosong / bukan angka
     * anggap 0.
     */

    if (
        Number.isNaN(quantity) ||
        quantity < 0
    ) {

        quantity = 0;

    }


    /*
     * Pastikan bilangan bulat.
     */

    quantity =
        Math.floor(quantity);


    estimatorCounts[
        activeQuantityType
    ] = quantity;


    /*
     * Hitung ulang seluruh estimator.
     */

    updateEstimator();


    closeQuantityModal();

}


/* =========================================================
   KLIK ANGKA COUNTER
   ========================================================= */

document
    .querySelectorAll(".counter-value")
    .forEach(counter => {

        counter.addEventListener(
            "click",
            () => {

                /*
                 * blackCount
                 * → black
                 *
                 * lightCount
                 * → light
                 */

                const type =
                    counter.id.replace(
                        "Count",
                        ""
                    );


                openQuantityModal(type);

            }
        );

    });


/* =========================================================
   TOMBOL TERAPKAN
   ========================================================= */

if (quantityModalConfirm) {

    quantityModalConfirm.addEventListener(
        "click",
        applyQuantity
    );

}


/* =========================================================
   TOMBOL BATAL
   ========================================================= */

if (quantityModalCancel) {

    quantityModalCancel.addEventListener(
        "click",
        closeQuantityModal
    );

}


/* =========================================================
   TOMBOL X
   ========================================================= */

if (quantityModalClose) {

    quantityModalClose.addEventListener(
        "click",
        closeQuantityModal
    );

}


/* =========================================================
   KLIK OVERLAY
   ========================================================= */

if (quantityModalOverlay) {

    quantityModalOverlay.addEventListener(
        "click",
        closeQuantityModal
    );

}


/* =========================================================
   ENTER UNTUK TERAPKAN
   ========================================================= */

if (quantityInput) {

    quantityInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                applyQuantity();

            }


            if (event.key === "Escape") {

                event.preventDefault();

                closeQuantityModal();

            }

        }
    );

}


/* =========================================================
   INITIAL STATE
   ========================================================= */

updateEstimator();


/* =========================================================
   GALERI CETAKITA — LIGHTBOX
   ========================================================= */

const cetakitaGalleryItems = document.querySelectorAll(
    ".cetakita-gallery-item"
);

const cetakitaLightbox = document.getElementById(
    "cetakitaLightbox"
);

const cetakitaLightboxImage = document.getElementById(
    "cetakitaLightboxImage"
);

const cetakitaLightboxTitle = document.getElementById(
    "cetakitaLightboxTitle"
);

const cetakitaLightboxDescription = document.getElementById(
    "cetakitaLightboxDescription"
);

const cetakitaLightboxClose = document.getElementById(
    "cetakitaLightboxClose"
);

const cetakitaLightboxBackdrop = document.querySelector(
    ".cetakita-lightbox-backdrop"
);


/* =========================
   BUKA LIGHTBOX
========================== */

function openCetakitaLightbox(item) {

    if (!cetakitaLightbox) return;

    const image = item.dataset.galleryImage;
    const title = item.dataset.galleryTitle || "CetaKita";
    const description =
        item.dataset.galleryDescription || "";

    if (cetakitaLightboxImage) {
        cetakitaLightboxImage.src = image;
        cetakitaLightboxImage.alt = title;
    }

    if (cetakitaLightboxTitle) {
        cetakitaLightboxTitle.textContent = title;
    }

    if (cetakitaLightboxDescription) {
        cetakitaLightboxDescription.textContent = description;
    }

    cetakitaLightbox.classList.add("active");

    cetakitaLightbox.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow = "hidden";
}


/* =========================
   TUTUP LIGHTBOX
========================== */

function closeCetakitaLightbox() {

    if (!cetakitaLightbox) return;

    cetakitaLightbox.classList.remove("active");

    cetakitaLightbox.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow = "";

    setTimeout(() => {

        if (cetakitaLightboxImage) {
            cetakitaLightboxImage.src = "";
        }

    }, 300);
}


/* =========================
   CLICK FOTO
========================== */

cetakitaGalleryItems.forEach(item => {

    item.addEventListener("click", () => {
        openCetakitaLightbox(item);
    });

});


/* =========================
   CLOSE BUTTON
========================== */

if (cetakitaLightboxClose) {

    cetakitaLightboxClose.addEventListener(
        "click",
        closeCetakitaLightbox
    );

}


/* =========================
   CLICK BACKDROP
========================== */

if (cetakitaLightboxBackdrop) {

    cetakitaLightboxBackdrop.addEventListener(
        "click",
        closeCetakitaLightbox
    );

}


/* =========================
   ESCAPE
========================== */

document.addEventListener("keydown", event => {

    if (
        event.key === "Escape" &&
        cetakitaLightbox &&
        cetakitaLightbox.classList.contains("active")
    ) {

        closeCetakitaLightbox();

    }

});