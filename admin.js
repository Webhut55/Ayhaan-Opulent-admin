import { db, ref, onValue, set, push, update, remove, showToast } from './firebase-config.js';

// --- Security / Login ---
const loginOverlay = document.getElementById('loginOverlay');
const loginBtn = document.getElementById('loginBtn');
const passCodeInput = document.getElementById('adminPassCode');

loginBtn.addEventListener('click', () => {
    if (passCodeInput.value === 'wbht2') { // Simple static code for demonstration
        loginOverlay.classList.add('hidden');
        showToast('Access Granted', 'success');
    } else {
        showToast('Invalid access code', 'error');
    }
});

// --- Branding / Logo ---
const logoUrlInput = document.getElementById('logoUrlInput');
const saveLogoBtn = document.getElementById('saveLogoBtn');
const logoRef = ref(db, 'branding/logo');

onValue(logoRef, (snapshot) => {
    if (snapshot.exists()) {
        logoUrlInput.value = snapshot.val();
    }
});

saveLogoBtn.addEventListener('click', () => {
    set(logoRef, logoUrlInput.value)
        .then(() => showToast('Logo updated successfully!', 'success'))
        .catch(err => showToast(`Error: ${err.message}`, 'error'));
});

// --- Product CRUD ---
const productForm = document.getElementById('productForm');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const formTitle = document.getElementById('formTitle');
const productsRef = ref(db, 'products');

// Handle Form Submit
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('productId').value;
    const name = document.getElementById('pName').value;
    const desc = document.getElementById('pDesc').value;
    const image = document.getElementById('pImg').value;
    const price = Number(document.getElementById('pPrice').value);
    const stock = Number(document.getElementById('pStock').value);

    const productData = { name, description: desc, image, price, stock };

    if (id) {
        // Edit Existing
        update(ref(db, `products/${id}`), productData)
            .then(() => {
                showToast('Product updated successfully', 'success');
                resetForm();
            })
            .catch(err => showToast(`Error: ${err.message}`, 'error'));
    } else {
        // Add New
        push(productsRef, productData)
            .then(() => {
                showToast('Product added successfully', 'success');
                resetForm();
            })
            .catch(err => showToast(`Error: ${err.message}`, 'error'));
    }
});

function resetForm() {
    productForm.reset();
    document.getElementById('productId').value = '';
    formTitle.innerText = 'Add New Product';
    cancelEditBtn.classList.add('hidden');
}

cancelEditBtn.addEventListener('click', resetForm);

// Handle Real-time Table
onValue(productsRef, (snapshot) => {
    const tbody = document.getElementById('inventoryTableBody');
    tbody.innerHTML = '';
    
    const data = snapshot.val();
    if (!data) return;

    Object.entries(data).forEach(([id, prod]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${prod.image}" alt="${prod.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
            <td>${prod.name}</td>
            <td>₹${prod.price}</td>
            <td>
                <span style="${prod.stock <= 0 ? 'color: var(--danger); font-weight: bold;' : ''}">
                    ${prod.stock}
                </span>
            </td>
            <td class="td-actions">
                <button class="btn btn-outline edit-btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" data-id="${id}">Edit</button>
                <button class="btn btn-danger delete-btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" data-id="${id}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Attach Action Listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const prod = data[id];
            
            document.getElementById('productId').value = id;
            document.getElementById('pName').value = prod.name;
            document.getElementById('pDesc').value = prod.description;
            document.getElementById('pImg').value = prod.image;
            document.getElementById('pPrice').value = prod.price;
            document.getElementById('pStock').value = prod.stock;
            
            formTitle.innerText = 'Edit Product';
            cancelEditBtn.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            // Custom Toast used instead of confirm() alert to respect strict UI rules
            const confirmToast = document.createElement('div');
            confirmToast.className = 'toast info show';
            confirmToast.style.pointerEvents = 'auto'; // allow clicking inside
            confirmToast.innerHTML = `
                <p style="margin-bottom: 0.5rem;">Are you sure you want to delete this product?</p>
                <div style="display:flex; gap:0.5rem;">
                    <button class="btn btn-danger" id="confirmDelBtn">Yes, Delete</button>
                    <button class="btn btn-outline" id="cancelDelBtn" style="color:white; border-color:white;">Cancel</button>
                </div>
            `;
            
            let container = document.getElementById('toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'toast-container';
                container.className = 'toast-container';
                document.body.appendChild(container);
            }
            container.appendChild(confirmToast);

            document.getElementById('confirmDelBtn').addEventListener('click', () => {
                remove(ref(db, `products/${id}`))
                    .then(() => showToast('Product deleted.', 'success'))
                    .catch(err => showToast(`Error: ${err.message}`, 'error'));
                confirmToast.remove();
            });

            document.getElementById('cancelDelBtn').addEventListener('click', () => {
                confirmToast.remove();
            });
        });
    });
});
