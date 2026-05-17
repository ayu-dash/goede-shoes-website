const Notification = require("../models/Notification");
const sendEmail = require("./email");

/**
 * Kirim notifikasi ganda: In-App Notification (database) dan Email (Nodemailer/Gmail)
 * @param {Object} options
 * @param {string} options.userId - ID User penerima notifikasi
 * @param {string} options.email - Alamat email penerima
 * @param {string} options.title - Judul notifikasi untuk In-App
 * @param {string} options.message - Isi pesan notifikasi untuk In-App & Email
 * @param {string} [options.type='order'] - Tipe notifikasi ('order', 'payment', 'system')
 * @param {string} [options.link] - Link navigasi di dashboard (optional)
 * @param {string} [options.emailSubject] - Subject email kustom (optional, default menggunakan title)
 */
const notifyUser = async ({ userId, email, title, message, type = 'order', link, emailSubject }) => {
    try {
        // 1. Simpan In-App Notification ke Database
        await Notification.create({
            user: userId,
            title,
            message,
            type,
            link,
        });
        console.log(`[Notification] In-app notification created for User ${userId}: ${title}`);

        // 2. Kirim Notifikasi via Email
        if (email) {
            await sendEmail({
                email,
                subject: emailSubject || title,
                message,
            });
            console.log(`[Notification] Email notification sent to ${email} with subject: ${emailSubject || title}`);
        }
    } catch (err) {
        console.error("Gagal memproses pengiriman notifikasi ganda:", err);
    }
};

module.exports = { notifyUser };
