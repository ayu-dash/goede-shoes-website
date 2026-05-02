/**
 * Custom Alert System for Goede Shoes
 * Replaces standard window.alert() with a premium modal
 */

function showCustomAlert(title, message, type = 'success', callback = null) {
    // Create elements
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    
    const iconMap = {
        success: 'fa-circle-check',
        error: 'fa-circle-xmark',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };

    overlay.innerHTML = `
        <div class="custom-alert-modal">
            <div class="custom-alert-icon ${type}">
                <i class="fa-solid ${iconMap[type]}"></i>
            </div>
            <h3 class="custom-alert-title">${title}</h3>
            <p class="custom-alert-message">${message}</p>
            <button class="custom-alert-btn ${type}">OK</button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Animate in
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);

    const closeBtn = overlay.querySelector('.custom-alert-btn');
    
    const closeAlert = () => {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
            if (callback && typeof callback === 'function') {
                callback();
            }
        }, 300);
    };

    closeBtn.addEventListener('click', closeAlert);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeAlert();
    });

    // Close on Enter key
    const handleKeydown = (e) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            closeAlert();
            document.removeEventListener('keydown', handleKeydown);
        }
    };
    document.addEventListener('keydown', handleKeydown);
}

function showCustomConfirm(title, message, type = 'warning', onConfirm = null) {
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    
    const iconMap = {
        success: 'fa-circle-check',
        error: 'fa-circle-xmark',
        warning: 'fa-circle-question',
        info: 'fa-circle-info'
    };

    overlay.innerHTML = `
        <div class="custom-alert-modal">
            <div class="custom-alert-icon ${type}">
                <i class="fa-solid ${iconMap[type]}"></i>
            </div>
            <h3 class="custom-alert-title">${title}</h3>
            <p class="custom-alert-message">${message}</p>
            <div style="display: flex; gap: 12px;">
                <button class="custom-alert-btn ${type}" id="confirmYes" style="flex: 2;">Ya, Lanjutkan</button>
                <button class="custom-alert-btn" id="confirmNo" style="flex: 1; background: #e2e8f0; color: #64748b;">Batal</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);

    const close = (isConfirmed) => {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
            if (isConfirmed && onConfirm) onConfirm();
        }, 300);
    };

    overlay.querySelector('#confirmYes').addEventListener('click', () => close(true));
    overlay.querySelector('#confirmNo').addEventListener('click', () => close(false));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
}

// Override default window.alert globally
window.alert = (msg) => {
    // If it looks like an error (contains "gagal", "error", "salah")
    const lowerMsg = msg.toLowerCase();
    let type = 'info';
    let title = 'Informasi';

    if (lowerMsg.includes('berhasil') || lowerMsg.includes('sukses')) {
        type = 'success';
        title = 'Sukses';
    } else if (lowerMsg.includes('gagal') || lowerMsg.includes('error') || lowerMsg.includes('salah')) {
        type = 'error';
        title = 'Terjadi Kesalahan';
    } else if (lowerMsg.includes('mohon') || lowerMsg.includes('harap') || lowerMsg.includes('wajib')) {
        type = 'warning';
        title = 'Peringatan';
    }

    showCustomAlert(title, msg, type);
};
