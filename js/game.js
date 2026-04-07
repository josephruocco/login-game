const MAX_BUTTONS = 64;
const SPEED = 2.5;
const CLICKS_BEFORE_ESCAPE = 5 + Math.floor(Math.random() * 2); // 5 or 6

let buttons = [];
let clickCount = 0;
let gameStarted = false;

// Sticky note click to fall
document.getElementById('sticky-note').addEventListener('click', function () {
    this.classList.add('falling');
    setTimeout(() => this.remove(), 900);
});

const submitBtn = document.getElementById('submit-btn');
const loginError = document.getElementById('login-error');

function handleLoginAttempt() {
    clickCount++;
    loginError.textContent = `Incorrect username or password (${clickCount})`;

    if (clickCount >= CLICKS_BEFORE_ESCAPE && !gameStarted) {
        gameStarted = true;
        escapeButton();
    }
}

// Login form submit
submitBtn.addEventListener('click', handleLoginAttempt);

// Also submit on Enter key
document.querySelectorAll('#login-form input').forEach(input => {
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            handleLoginAttempt();
        }
    });
});

function escapeButton() {
    // Get the submit button's current position on screen
    const rect = submitBtn.getBoundingClientRect();
    const x = rect.left;
    const y = rect.top;

    // Hide the submit button
    submitBtn.style.display = 'none';

    // Create the first bouncing button at the same position
    const angle = Math.random() * Math.PI * 2;
    createButton(x, y, Math.cos(angle) * SPEED, Math.sin(angle) * SPEED);
    moveButtons();
}

function createButton(x, y, vx, vy) {
    const button = document.createElement('button');
    button.textContent = 'Login';
    button.className = 'loginButton';
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;

    button.addEventListener('click', (e) => {
        e.stopPropagation();
        splitButton(button);
    });

    buttons.push({ element: button, x, y, vx, vy });
    document.body.appendChild(button);
}

function splitButton(button) {
    const index = buttons.findIndex(b => b.element === button);
    if (index === -1) return;

    if (buttons.length >= MAX_BUTTONS) return;

    const { x, y, vx, vy } = buttons[index];
    buttons.splice(index, 1);
    button.remove();

    const speed = SPEED * (0.85 + Math.random() * 0.3);
    const angle = Math.random() * Math.PI * 2;
    const px = Math.cos(angle) * speed;
    const py = Math.sin(angle) * speed;

    createButton(x, y, vx + px, vy + py);
    createButton(x, y, vx - px, vy - py);
}

function resolveAABB(b1, b2) {
    const w1 = b1.element.offsetWidth || 80;
    const h1 = b1.element.offsetHeight || 34;
    const w2 = b2.element.offsetWidth || 80;
    const h2 = b2.element.offsetHeight || 34;

    const cx1 = b1.x + w1 / 2, cy1 = b1.y + h1 / 2;
    const cx2 = b2.x + w2 / 2, cy2 = b2.y + h2 / 2;

    const dx = cx1 - cx2;
    const dy = cy1 - cy2;
    const halfW = (w1 + w2) / 2;
    const halfH = (h1 + h2) / 2;

    if (Math.abs(dx) >= halfW || Math.abs(dy) >= halfH) return;

    const penX = halfW - Math.abs(dx);
    const penY = halfH - Math.abs(dy);

    if (penX < penY) {
        const sign = dx > 0 ? 1 : -1;
        b1.x += sign * penX / 2;
        b2.x -= sign * penX / 2;
        [b1.vx, b2.vx] = [b2.vx, b1.vx];
    } else {
        const sign = dy > 0 ? 1 : -1;
        b1.y += sign * penY / 2;
        b2.y -= sign * penY / 2;
        [b1.vy, b2.vy] = [b2.vy, b1.vy];
    }
}

function moveButtons() {
    const W = window.innerWidth;
    const H = window.innerHeight;

    for (const b of buttons) {
        b.x += b.vx;
        b.y += b.vy;

        const w = b.element.offsetWidth || 80;
        const h = b.element.offsetHeight || 34;

        if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx); }
        if (b.x + w > W) { b.x = W - w; b.vx = -Math.abs(b.vx); }
        if (b.y < 0) { b.y = 0; b.vy = Math.abs(b.vy); }
        if (b.y + h > H) { b.y = H - h; b.vy = -Math.abs(b.vy); }

        b.element.style.left = `${b.x}px`;
        b.element.style.top = `${b.y}px`;
    }

    for (let i = 0; i < buttons.length; i++) {
        for (let j = i + 1; j < buttons.length; j++) {
            resolveAABB(buttons[i], buttons[j]);
        }
    }

    requestAnimationFrame(moveButtons);
}
