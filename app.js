// app.js - Bangladesh Tourism Board Visitor Frontend Logic

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    loadLiveNotices();
    setupDefaultData();
    renderDestinations('all');
    renderCultureSection('all');
    renderFoodSection();
}

// Default Data initialization if localStorage is empty
function setupDefaultData() {
    if (!localStorage.getItem('btb_destinations')) {
        const defaultDests = [
            { id: 1, name: "Cox's Bazar Sea Beach", category: "beaches", district: "Cox's Bazar", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e", "https://images.unsplash.com/photo-1544644181-1484b3fdfc62", "https://images.unsplash.com/photo-1506744038136-46273834b3fb"], shortDesc: "World's longest natural unbroken sandy sea beach.", fullDesc: "Cox's Bazar is the tourist capital of Bangladesh stretching over 120 km.", hotels: [{ name: "Sayeman Beach", type: "5-Star", rating: "⭐ 4.9/5", description: "Luxury beach resort", link: "#" }] },
            { id: 2, name: "Sajek Valley", category: "hills", district: "Rangamati", image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62", images: ["https://images.unsplash.com/photo-1544644181-1484b3fdfc62", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", "https://images.unsplash.com/photo-1506744038136-46273834b3fb"], shortDesc: "Kingdom of clouds in hill tracts.", fullDesc: "Sajek Valley is known as Queen of Hills at 1800 feet height.", hotels: [{ name: "Sajek Resort", type: "Eco", rating: "⭐ 4.6/5", description: "Scenic mountain view", link: "#" }] },
            { id: 3, name: "The Sundarbans", category: "forests", district: "Bagerhat", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb", images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", "https://images.unsplash.com/photo-1544644181-1484b3fdfc62"], shortDesc: "Largest mangrove forest and Royal Bengal Tiger habitat.", fullDesc: "UNESCO World Heritage Site featuring tidal halophytic mangrove forests.", hotels: [{ name: "Jungle Resort", type: "Lodge", rating: "⭐ 4.4/5", description: "Deep forest stay", link: "#" }] }
        ];
        localStorage.setItem('btb_destinations', JSON.stringify(defaultDests));
    }

    if (!localStorage.getItem('btb_cultural')) {
        const defaultCultural = [
            { name: "Pohela Boishakh Festival", type: "cultural", date: "April 14", location: "Dhaka", description: "The grand celebration of Bengali New Year with processions and concert.", images: ["https://images.unsplash.com/photo-1533105079780-92b9be482077", "", ""] },
            { name: "Dhaka International Trade Fair", type: "fair", date: "January", location: "Purbachal, Dhaka", description: "Mega industrial and commercial trade exposition showcasing Bangladeshi products.", images: ["https://images.unsplash.com/photo-1511578314322-379afb476865", "", ""] }
        ];
        localStorage.setItem('btb_cultural', JSON.stringify(defaultCultural));
    }

    if (!localStorage.getItem('btb_foods')) {
        const defaultFoods = [
            { name: "Kacchi Biryani", region: "Old Dhaka", description: "Aromatic basmati rice layered with tender mutton and rich spices.", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8" },
            { name: "Hilsa Fish Curry (Ilish Bhuna)", region: "Coastal Region", description: "National fish of Bangladesh cooked in spicy mustard gravy.", image: "https://images.unsplash.com/photo-1544025162-d76694265947" },
            { name: "Pitha Puli (Traditional Cakes)", region: "Rural Bengal", description: "Winter seasonal rice-flour sweets prepared across villages.", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc" }
        ];
        localStorage.setItem('btb_foods', JSON.stringify(defaultFoods));
    }
}

// Pagination state for Destinations
let destDisplayCount = 9;

function renderDestinations(category = 'all') {
    const grid = document.getElementById('destinationsGrid');
    const seeMoreContainer = document.getElementById('destSeeMoreContainer');
    if (!grid) return;

    const destinations = JSON.parse(localStorage.getItem('btb_destinations')) || [];
    const filtered = category === 'all' ? destinations : destinations.filter(d => d.category === category);
    const sliced = filtered.slice(0, destDisplayCount);

    if (filtered.length === 0) {
        grid.innerHTML = `<p class="text-xs text-slate-400 col-span-3 text-center py-10">No destinations found in this category.</p>`;
        if(seeMoreContainer) seeMoreContainer.innerHTML = '';
        return;
    }

    grid.innerHTML = sliced.map(d => {
        const images = (d.images && d.images.length >= 3 && d.images[0]) ? d.images : [d.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'];
        return `
        <div class="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-emerald-500/50 transition group cursor-pointer" onclick="openDestModalById(${d.id})">
            <div class="h-48 overflow-hidden relative">
                <img src="${images[0]}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="${d.name}">
                <span class="absolute top-3 left-3 px-2.5 py-1 bg-emerald-950/85 backdrop-blur-md text-emerald-300 text-[10px] font-bold rounded-lg uppercase border border-emerald-800/40">${d.category}</span>
            </div>
            <div class="p-5 space-y-2">
                <div class="flex justify-between items-center text-xs text-slate-400">
                    <span><i class="fa-solid fa-location-dot text-bdRed mr-1"></i> ${d.district}</span>
                    <span class="text-yellow-400 font-bold font-mono">${d.hotels ? d.hotels.length : 0} Hotels</span>
                </div>
                <h3 class="text-lg font-bold text-white">${d.name}</h3>
                <p class="text-xs text-slate-300 line-clamp-2">${d.shortDesc || ''}</p>
                <div class="pt-2 flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span>Explore Details & Hotels</span>
                    <i class="fa-solid fa-arrow-right group-hover:translate-x-1 transition"></i>
                </div>
            </div>
        </div>
        `;
    }).join('');

    // See More Button control
    if (seeMoreContainer) {
        if (destDisplayCount < filtered.length) {
            seeMoreContainer.innerHTML = `
                <button onclick="loadMoreDestinations()" class="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg transition">
                    See More Destinations <i class="fa-solid fa-arrow-down ml-1"></i>
                </button>
            `;
        } else {
            seeMoreContainer.innerHTML = '';
        }
    }
}

function loadMoreDestinations() {
    destDisplayCount += 9;
    renderDestinations('all');
}

function filterDestinations(category) {
    destDisplayCount = 9;
    renderDestinations(category);
}

// Cultural Programs & Fairs Section
function renderCultureSection(type = 'all') {
    const grid = document.getElementById('culturalGrid');
    if (!grid) return;

    const cultural = JSON.parse(localStorage.getItem('btb_cultural')) || [];
    const filtered = type === 'all' ? cultural : cultural.filter(c => c.type === type);

    if (filtered.length === 0) {
        grid.innerHTML = `<p class="text-xs text-slate-400 col-span-3 text-center py-10">No events found in this category.</p>`;
        return;
    }

    grid.innerHTML = filtered.map(c => `
        <div class="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-5 space-y-3">
            <div class="h-44 rounded-xl overflow-hidden">
                <img src="${c.images && c.images[0] ? c.images[0] : 'https://images.unsplash.com/photo-1533105079780-92b9be482077'}" class="w-full h-full object-cover" alt="${c.name}">
            </div>
            <div class="space-y-1">
                <span class="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded font-bold uppercase border border-amber-800/40">${c.type || 'Festival'}</span>
                <h3 class="text-base font-bold text-white mt-1">${c.name}</h3>
                <p class="text-xs text-slate-300">${c.description || ''}</p>
                <div class="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <span><i class="fa-solid fa-calendar text-amber-400 mr-1"></i> ${c.date}</span>
                    <span><i class="fa-solid fa-location-dot text-bdRed mr-1"></i> ${c.location}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function filterCulture(type) {
    renderCultureSection(type);
    document.querySelectorAll('.culture-btn').forEach(btn => {
        if(btn.getAttribute('data-type') === type) {
            btn.className = "px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl transition shadow-md culture-btn";
        } else {
            btn.className = "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition culture-btn";
        }
    });
}

// Traditional Foods Section
function renderFoodSection() {
    const grid = document.getElementById('foodsGrid');
    if (!grid) return;

    const foods = JSON.parse(localStorage.getItem('btb_foods')) || [];
    if (foods.length === 0) {
        grid.innerHTML = `<p class="text-xs text-slate-400 col-span-3 text-center py-10">No food items added yet.</p>`;
        return;
    }

    grid.innerHTML = foods.map(f => `
        <div class="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg p-5 space-y-3">
            <div class="h-44 rounded-xl overflow-hidden">
                <img src="${f.image}" class="w-full h-full object-cover" alt="${f.name}">
            </div>
            <div class="space-y-1">
                <span class="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded font-bold uppercase border border-red-800/40">${f.region}</span>
                <h3 class="text-lg font-bold text-white mt-1">${f.name}</h3>
                <p class="text-xs text-slate-300">${f.description}</p>
            </div>
        </div>
    `).join('');
}

// Live Notices from Firebase
function loadLiveNotices() {
    const container = document.getElementById('noticeListContainer');
    if (!container) return;

    db.collection('notices').onSnapshot(snapshot => {
        if (snapshot.empty) {
            container.innerHTML = `<p class="text-xs text-slate-400">No active notices available.</p>`;
            return;
        }
        let html = '';
        snapshot.forEach(doc => {
            const n = doc.data();
            html += `
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-950 p-3 rounded-xl border border-slate-800 gap-2">
                    <div>
                        <span class="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase border border-emerald-800/40 mr-2">${n.category || 'General'}</span>
                        <span class="text-xs font-bold text-white cursor-pointer hover:text-emerald-400 transition" onclick="openPdfModal('${n.pdfUrl}', '${n.title}')">${n.title}</span>
                    </div>
                    <div class="flex items-center gap-3 text-[11px] text-slate-400">
                        <span><i class="fa-solid fa-calendar mr-1"></i> ${n.date || ''}</span>
                        ${n.pdfUrl ? `<button onclick="openPdfModal('${n.pdfUrl}', '${n.title}')" class="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold transition flex items-center gap-1.5 shadow"><i class="fa-solid fa-file-pdf"></i> View Notice</button>` : ''}
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    });
}

function openPdfModal(url, title) {
    document.getElementById('pdfModalTitle').textContent = title;
    document.getElementById('pdfFrame').src = url;
    document.getElementById('pdfModal').classList.remove('hidden');
}
function closePdfModal() {
    document.getElementById('pdfModal').classList.add('hidden');
    document.getElementById('pdfFrame').src = '';
}

// Destination Modal Details
function openDestModalById(id) {
    const destinations = JSON.parse(localStorage.getItem('btb_destinations')) || [];
    const d = destinations.find(item => item.id === id);
    if (!d) return;

    const content = document.getElementById('detailsModalContent');
    const gpsContainer = document.getElementById('gpsNavButtonContainer');

    content.innerHTML = `
        <div class="space-y-4">
            <div class="h-64 rounded-2xl overflow-hidden relative">
                <img src="${d.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'}" class="w-full h-full object-cover" alt="${d.name}">
                <span class="absolute top-3 left-3 px-3 py-1 bg-emerald-950/85 backdrop-blur-md text-emerald-300 text-xs font-bold rounded-xl uppercase border border-emerald-800/40">${d.category}</span>
            </div>
            <div>
                <div class="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <span><i class="fa-solid fa-location-dot text-bdRed"></i> ${d.district}</span>
                </div>
                <h2 class="text-2xl font-extrabold text-white">${d.name}</h2>
                <p class="text-xs text-slate-300 mt-2 leading-relaxed">${d.fullDesc || d.shortDesc || ''}</p>
            </div>

            <div class="border-t border-slate-800 pt-4">
                <h3 class="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <i class="fa-solid fa-hotel text-amber-400"></i> Recommended Hotels & Resorts
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    ${d.hotels && d.hotels.length > 0 ? d.hotels.map(h => `
                        <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                            <div class="flex justify-between items-start">
                                <div>
                                    <div class="font-bold text-white text-xs">${h.name}</div>
                                    <div class="text-[11px] text-emerald-400">${h.type || 'Standard'}</div>
                                </div>
                                <span class="text-yellow-400 font-bold text-xs font-mono bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">${h.rating || '⭐ 4.5/5'}</span>
                            </div>
                            <p class="text-[11px] text-slate-400">${h.description || ''}</p>
                            ${h.link ? `<a href="${h.link}" target="_blank" class="block w-full py-1.5 bg-bdRed hover:bg-red-700 text-white text-center text-[11px] font-bold rounded-lg transition shadow"><i class="fa-solid fa-arrow-up-right-from-square mr-1"></i> Book Now</a>` : ''}
                        </div>
                    `).join('') : '<p class="text-xs text-slate-500">No hotels added yet.</p>'}
                </div>
            </div>
        </div>
    `;

    if (gpsContainer) {
        gpsContainer.innerHTML = `
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.name + ' ' + d.district + ' Bangladesh')}" target="_blank" class="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow">
                <i class="fa-solid fa-location-arrow"></i> Live GPS Nav
            </a>
        `;
    }
    document.getElementById('detailsModal').classList.remove('hidden');
}
function closeDetailsModal() { document.getElementById('detailsModal').classList.add('hidden'); }

// Official Tourism Board Video Gallery Style Board Members Modal
function openBoardModal() {
    const grid = document.getElementById('boardMembersGrid');
    if (!grid) return;
    const members = JSON.parse(localStorage.getItem('btb_board_members')) || [
        { name: "Chairman, BTB", role: "Chief Executive Officer", contact: "chairman@tourism.gov.bd", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" },
        { name: "Director (Planning)", role: "Head of Planning", contact: "planning@tourism.gov.bd", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e" }
    ];

    grid.innerHTML = members.map(m => `
        <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
            <img src="${m.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}" class="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/50" alt="${m.name}">
            <div class="space-y-1">
                <div class="text-sm font-bold text-white">${m.name}</div>
                <div class="text-xs text-emerald-400 font-semibold">${m.role}</div>
                <div class="text-xs text-slate-400"><i class="fa-solid fa-envelope mr-1 text-bdRed"></i> ${m.contact}</div>
            </div>
        </div>
    `).join('');

    document.getElementById('boardModal').classList.remove('hidden');
}
function closeBoardModal() { document.getElementById('boardModal').classList.add('hidden'); }
function toggleMobileMenu() { document.getElementById('mobileMenu').classList.toggle('hidden'); }