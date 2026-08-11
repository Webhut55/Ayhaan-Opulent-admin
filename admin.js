/* ========================================================
   AYHAAN OPULENT | SUPABASE MANAGEMENT SYSTEM (ADMIN.JS)
   ======================================================== */

// Initialize Lucide Icons
lucide.createIcons();

// Supabase Configuration & Client Initialization
const SUPABASE_URL = "https://orjxoslyjonedljqnzgu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yanhvc2x5am9uZWRsanFuemd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMTMzMjAsImV4cCI6MjEwMTY4OTMyMH0.dWvnC8CkaUg-uNw2S0rNKklBOwx3ai6bMdI-ZA3RG3I";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin Auth (PIN Check)
document.getElementById('login-btn').addEventListener('click', () => {
    const pin = document.getElementById('pin-input').value.trim();
    if(pin === '8590' || pin === '1234') {
        document.getElementById('auth-overlay').classList.add('hidden');
        document.getElementById('admin-app').classList.remove('hidden');
        fetchSupabaseData(); // Load all data upon successful entry
    } else {
        document.getElementById('auth-error').classList.remove('hidden');
    }
});

// Allow Enter key for login
document.getElementById('pin-input').addEventListener('keydown', (e) => {
    if(e.key === 'Enter') document.getElementById('login-btn').click();
});

// Tab Navigation Logic
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => {
            b.classList.remove('text-primary', 'bg-white/5', 'border-primary');
            b.classList.add('text-gray-400', 'border-transparent');
        });
        btn.classList.add('text-primary', 'bg-white/5', 'border-primary');
        btn.classList.remove('text-gray-400', 'border-transparent');
        
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.getElementById(btn.getAttribute('data-target')).classList.add('active');
    });
});

/* ================= DATA LOADING & STATS ================= */
async function fetchSupabaseData() {
    await loadHeroSlides();
    await loadCategories();
    await loadProducts();
    lucide.createIcons();
}

// 1. Hero Slides
async function loadHeroSlides() {
    const { data: slides, error } = await supabaseClient.from('hero_slides').select('*');
    if(error) { console.error('Error fetching slides:', error.message); return; }
    
    if(slides) {
        document.getElementById('stat-slides').textContent = slides.length;
        document.getElementById('slides-grid').innerHTML = slides.map(s => `
            <div class="bg-white border border-gray-200 p-4 shadow-sm relative group">
                <img src="${s.image_url || s.imageUrl || ''}" class="w-full h-32 object-cover mb-4 bg-gray-100">
                <h4 class="font-serif font-bold text-lg text-dark truncate">${s.title}</h4>
                <p class="text-xs text-gray-500 mb-4 truncate">${s.subtitle || ''}</p>
                <div class="flex gap-2">
                    <button onclick='editSlide(${JSON.stringify(s).replace(/'/g, "&#39;")})' class="flex-1 bg-gray-100 hover:bg-gray-200 py-1.5 text-xs uppercase tracking-wider font-semibold">Edit</button>
                    <button onclick='deleteRecord("hero_slides", "${s.id}")' class="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-1.5 text-xs uppercase tracking-wider font-semibold">Delete</button>
                </div>
            </div>
        `).join('');
    }
}

// 2. Collections (Categories)
async function loadCategories() {
    const { data: cats, error } = await supabaseClient.from('categories').select('*');
    if(error) { console.error('Error fetching categories:', error.message); return; }

    if(cats) {
        document.getElementById('stat-categories').textContent = cats.length;
        
        // Populate select dropdown in Product modal
        const catSelect = document.getElementById('p-category');
        catSelect.innerHTML = `<option value="">Select Collection</option>` + cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
        
        document.getElementById('categories-grid').innerHTML = cats.map(c => `
            <div class="bg-white border border-gray-200 p-6 text-center shadow-sm relative">
                <img src="${c.image_url || c.imageUrl || ''}" class="w-20 h-20 mx-auto rounded-full object-cover mb-4 border-2 border-primary bg-lightGold">
                <h4 class="font-serif font-bold text-dark text-lg">${c.name}</h4>
                <div class="mt-4 flex gap-2 justify-center">
                    <button onclick='editCategory(${JSON.stringify(c).replace(/'/g, "&#39;")})' class="text-xs uppercase tracking-wider font-semibold text-gray-600 hover:text-dark">Edit</button>
                    <span class="text-gray-300">|</span>
                    <button onclick="deleteRecord('categories', '${c.id}')" class="text-red-500 text-xs uppercase tracking-wider font-semibold hover:underline">Remove</button>
                </div>
            </div>
        `).join('');
    }
}

// 3. Products (Jewelry Portfolio)
async function loadProducts() {
    const { data: prods, error } = await supabaseClient.from('products').select('*');
    if(error) { console.error('Error fetching products:', error.message); return; }

    if(prods) {
        document.getElementById('stat-products').textContent = prods.length;
        document.getElementById('products-table').innerHTML = prods.map(p => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4"><img src="${p.image1 || p.imageUrl || ''}" class="w-10 h-10 object-cover rounded bg-lightGold border"></td>
                <td class="px-6 py-4 font-serif font-bold text-dark">${p.name}</td>
                <td class="px-6 py-4 text-xs text-gray-500 uppercase tracking-wide">${p.category}</td>
                <td class="px-6 py-4 font-semibold text-primary">₹${p.price}</td>
                <td class="px-6 py-4 text-right space-x-2">
                    <button onclick='editProduct(${JSON.stringify(p).replace(/'/g, "&#39;")})' class="text-gray-500 hover:text-dark p-2 text-xs uppercase font-semibold">Edit</button>
                    <button onclick="deleteRecord('products', '${p.id}')" class="text-red-500 hover:text-red-700 p-2 inline-flex items-center"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </td>
            </tr>
        `).join('');
    }
}

/* ================= UTILITY & HELPERS ================= */

// Image to Base64 Encoder
function encodeImage(input, previewId, hiddenInputId) {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById(previewId).src = e.target.result;
        document.getElementById(hiddenInputId).value = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Modal Helpers
function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
    document.getElementById(id).classList.add('flex');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
    document.getElementById(id).classList.remove('flex');
    const form = document.getElementById(id).querySelector('form');
    if(form) form.reset();
    document.querySelectorAll('img[id$="-preview"]').forEach(img => img.src = '');
    document.querySelectorAll('input[type="hidden"]').forEach(inp => {
        if(inp.id !== 's-id' && inp.id !== 'p-id' && inp.id !== 'c-id') inp.value = '';
    });
}

function showToast(msg) {
    const t = document.getElementById('admin-toast');
    document.getElementById('toast-msg').textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// Global Delete Handler
async function deleteRecord(table, id) {
    if(confirm('Delete this record permanently?')) {
        const { error } = await supabaseClient.from(table).delete().eq('id', id);
        if(!error) {
            showToast('Deleted successfully.');
            fetchSupabaseData();
        } else {
            alert('Delete failed: ' + error.message);
        }
    }
}

/* ================= EDIT HANDLERS (PRE-FILL) ================= */

window.editSlide = function(slide) {
    document.getElementById('s-id').value = slide.id;
    document.getElementById('s-title').value = slide.title;
    document.getElementById('s-subtitle').value = slide.subtitle || '';
    const imgUrl = slide.image_url || slide.imageUrl || '';
    document.getElementById('s-image-preview').src = imgUrl;
    document.getElementById('s-image-base64').value = imgUrl;
    openModal('slide-modal');
};

window.editCategory = function(cat) {
    document.getElementById('c-id').value = cat.id;
    document.getElementById('c-name').value = cat.name;
    const imgUrl = cat.image_url || cat.imageUrl || '';
    document.getElementById('c-image-preview').src = imgUrl;
    document.getElementById('c-image-base64').value = imgUrl;
    openModal('category-modal');
};

window.editProduct = function(prod) {
    document.getElementById('p-id').value = prod.id;
    document.getElementById('p-name').value = prod.name;
    document.getElementById('p-price').value = prod.price;
    document.getElementById('p-category').value = prod.category;
    const imgUrl = prod.image1 || prod.image_url || prod.imageUrl || '';
    document.getElementById('p-image-preview').src = imgUrl;
    document.getElementById('p-image-base64').value = imgUrl;
    openModal('product-modal');
};

/* ================= FORM SUBMISSION HANDLERS ================= */

// 1. Slide Form Submit
document.getElementById('slide-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('s-id').value;
    const payload = {
        title: document.getElementById('s-title').value,
        subtitle: document.getElementById('s-subtitle').value,
        image_url: document.getElementById('s-image-base64').value // Matching database column name
    };
    
    if(!id) payload.id = crypto.randomUUID();

    const { error } = id 
        ? await supabaseClient.from('hero_slides').update(payload).eq('id', id)
        : await supabaseClient.from('hero_slides').insert([payload]);

    if(!error) {
        showToast('Presentation Saved');
        closeModal('slide-modal');
        fetchSupabaseData();
    } else {
        alert('Error saving slide: ' + error.message);
    }
});

// 2. Category Form Submit
document.getElementById('category-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('c-id').value;
    const payload = {
        name: document.getElementById('c-name').value,
        image_url: document.getElementById('c-image-base64').value // Matching database column name
    };
    
    if(!id) payload.id = crypto.randomUUID();

    const { error } = id 
        ? await supabaseClient.from('categories').update(payload).eq('id', id)
        : await supabaseClient.from('categories').insert([payload]);

    if(!error) {
        showToast('Collection Saved');
        closeModal('category-modal');
        fetchSupabaseData();
    } else {
        alert('Error saving collection: ' + error.message);
    }
});

// 3. Product Form Submit
document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('p-id').value;
    const payload = {
        name: document.getElementById('p-name').value,
        price: parseFloat(document.getElementById('p-price').value),
        category: document.getElementById('p-category').value,
        image1: document.getElementById('p-image-base64').value
    };
    
    if(!id) payload.id = crypto.randomUUID();

    const { error } = id 
        ? await supabaseClient.from('products').update(payload).eq('id', id)
        : await supabaseClient.from('products').insert([payload]);

    if(!error) {
        showToast('Product Saved');
        closeModal('product-modal');
        fetchSupabaseData();
    } else {
        alert('Error saving product: ' + error.message);
    }
});